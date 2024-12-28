const express = require("express");
const dotenv = require("dotenv");
const { generateSlug } = require("random-word-slugs");
const {
    ECSClient,
    RunTaskCommand,
    DescribeTasksCommand,
} = require("@aws-sdk/client-ecs");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");

dotenv.config({
    path: "./.env",
});

const app = express();
const port = process.env.PORT || 9000;

// AWS ECS Client Setup
const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const config = {
    CLUSTER: process.env.ECS_CLUSTER_NAME,
    TASK: process.env.ECS_TASK_DEFINITION,
};

// Prisma Client Setup
const prisma = new PrismaClient();

// Redis Setup
const subscriber = new Redis(process.env.REDIS_URL);

// Socket.io Setup
const io = new Server({ cors: { origin: "*" } });

io.on("connection", (socket) => {
    socket.on("subscribe", (channel) => {
        socket.join(channel);
        socket.emit(
            "message",
            JSON.stringify({
                timestamp: new Date().toISOString(),
                status: "connected",
                message: `Joined ${channel}`,
            })
        );
    });
});

io.listen(9001, () => {
    console.log("Socket server running on port 9001");
});

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Task Status Monitoring
async function waitForTaskCompletion(taskArn, projectSlug) {
    let lastStatus = "";

    while (true) {
        try {
            const describeCommand = new DescribeTasksCommand({
                cluster: config.CLUSTER,
                tasks: [taskArn],
            });

            const { tasks } = await ecsClient.send(describeCommand);

            if (!tasks || tasks.length === 0) {
                throw new Error("Task not found");
            }

            const task = tasks[0];

            // Only emit if status has changed
            if (task.lastStatus !== lastStatus) {
                lastStatus = task.lastStatus;
                io.to(`logs:${projectSlug}`).emit(
                    "message",
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        status: task.lastStatus,
                        projectId: projectSlug,
                    })
                );
            }

            // Check container exit code when task is stopped
            if (task.lastStatus === "STOPPED") {
                const containerExitCode = task.containers[0].exitCode;

                if (containerExitCode !== 0 || task.stoppedReason) {
                    throw new Error(
                        `Task stopped: ${task.stoppedReason || "Unknown error"}`
                    );
                }

                io.to(`logs:${projectSlug}`).emit(
                    "message",
                    JSON.stringify({
                        timestamp: new Date().toISOString(),
                        status: "COMPLETED",
                        projectId: projectSlug,
                    })
                );

                return task;
            }

            // Wait before next check
            await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {
            io.to(`logs:${projectSlug}`).emit(
                "message",
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    status: "ERROR",
                    error: error.message,
                    projectId: projectSlug,
                })
            );
            throw error;
        }
    }
}

// Routes
app.get("/", (req, res) => {
    res.send("Build Server is running");
});

app.post("/project", async (req, res) => {
    z.object({
        name: z.string(),
        gitURL: z.string(),
    });

    const safeParse = schema.safeParse(req.body);

    if (!safeParse.success) {
        return res.status(400).json({
            error: "Invalid request body",
            details: safeParse.error.errors,
        });
    }

    const { name, gitURL } = safeParse.data;

    try {
        const project = await prisma.project.create({
            data: {
                name,
                gitURL,
                subDomain: generateSlug(),
            },
        });

        return res.status(201).json({
            status: "success",
            data: project,
        });
    } catch (error) {
        console.error("Failed to create project:", error);
        return res.status(500).json({
            error: "Failed to create project",
            message: error.message,
        });
    }
});

app.post("/deploy", async (req, res) => {
    const { projectId } = req.body;

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        return res.status(404).json({
            error: "Project not found",
        });
    }

    const deployment = await prisma.deployment.create({
        data: {
            project: { connect: { id: projectId } },
            status: "QUEUED",

        },
    });

    try {
        const command = new RunTaskCommand({
            cluster: config.CLUSTER,
            taskDefinition: config.TASK,
            launchType: "FARGATE",
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        "subnet-0615a4578ea7942d1",
                        "subnet-0a0a1225f19c481f1",
                        "subnet-0d64dd757f3946666",
                    ],
                    assignPublicIp: "ENABLED",
                    securityGroups: ["sg-03e70e1084e006cc6"],
                },
            },
            overrides: {
                containerOverrides: [
                    {
                        name: "builder-image",
                        environment: [
                            {
                                name: "PROJECT_ID",
                                value: projectId,
                            },
                            {
                                name: "GIT_REPOSITORY__URL",
                                value: project.gitURL,
                            },
                            {
                                name: "DEPLOYMENT_ID",
                                value: deployment.id.toString(),
                            }
                        ],
                    },
                ],
            },
        });

        const { tasks } = await ecsClient.send(command);

        if (!tasks || tasks.length === 0) {
            throw new Error("Failed to start task");
        }

        const taskArn = tasks[0].taskArn;

        // Start monitoring the task
        waitForTaskCompletion(taskArn, projectSlug).catch((error) => {
            console.error(`Task failed: ${error.message}`);
        });

        // Return immediate response
        return res.status(201).json({
            projectSlug,
            url: `http://${projectSlug}.localhost:8000`,
            taskArn,
            status: "STARTED",
        });
    } catch (error) {
        console.error("Failed to create project:", error);
        return res.status(500).json({
            error: "Failed to start build task",
            message: error.message,
        });
    }
});

// Redis subscription for build logs
async function initRedisSubscribe() {
    try {
        console.log("Subscribing to build logs...");
        await subscriber.psubscribe("logs:*");

        subscriber.on("pmessage", (pattern, channel, message) => {
            try {
                // Validate message is JSON before forwarding
                const parsed = JSON.parse(message);
                io.to(channel).emit("message", message);
            } catch (error) {
                console.error("Invalid message format:", error);
            }
        });

        subscriber.on("error", (error) => {
            console.error("Redis subscription error:", error);
        });
    } catch (error) {
        console.error("Failed to initialize Redis subscription:", error);
        // Attempt to reconnect after delay
        setTimeout(initRedisSubscribe, 5000);
    }
}

// Initialize Redis subscription
initRedisSubscribe();

// Error handling
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
});

// Start server
app.listen(port, () => {
    console.log(`Build server running on port ${port}`);
});
