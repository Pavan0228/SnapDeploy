const express = require("express");
const dotenv = require("dotenv");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@clickhouse/client");
const { Kafka } = require("kafkajs");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

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

// clickhouse Setup
const client = createClient({
    host: process.env.CLICKHOUSE_HOST,
    database: "default",
    username: process.env.CLICKHOUSE_USER,
    password: process.env.CLICKHOUSE_PASSWORD,
});

// Kafka Setup
const kafka = new Kafka({
    clientId: `api-server`,
    brokers: [process.env.KAFKA_BROKER],
    ssl: {
        ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
    },
    sasl: {
        mechanism: "plain",
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
    },
});

const consumer = kafka.consumer({ groupId: "api-server-logs-consumer" });

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
    res.send("Build Server is running");
});

app.post("/project", async (req, res) => {
    const projectSchema = z.object({
        name: z.string(),
        gitURL: z.string(),
    });

    const safeParse = projectSchema.safeParse(req.body);

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
                subdomain: generateSlug(),
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
                            },
                        ],
                    },
                ],
            },
        });

        const { tasks } = await ecsClient.send(command);

        if (!tasks || tasks.length === 0) {
            throw new Error("Failed to start task");
        }

        // Update deployment status to STARTED
        await prisma.deployment.update({
            where: { id: deployment.id },
            data: { status: "STARTED" }
        });

        return res.status(201).json({
            status: "STARTED",
            data: { deploymentId: deployment.id },
            message: "Deployment started",
        });
    } catch (error) {
        console.error("Failed to start deployment:", error);
        await prisma.deployment.update({
            where: { id: deployment.id },
            data: { status: "FAILED", error: error.message }
        });
        return res.status(500).json({
            error: "Failed to start build task",
            message: error.message,
        });
    }
});

app.get('/logs/:id', async (req, res) => {
    const id = req.params.id;
    const logs = await client.query({
        query: `SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id = {deployment_id:String}`,
        query_params: {
            deployment_id: id
        },
        format: 'JSONEachRow'
    });

    const rawLogs = await logs.json();

    return res.json({ logs: rawLogs });
});

async function initKafkaConsumer() {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: "container-logs" });

        await consumer.run({
            autoCommit: false,
            eachBatch: async ({
                batch,
                heartbeat,
                commitOffsetsIfNecessary,
                resolveOffset,
            }) => {
                const { messages } = batch;
                console.log("Received messages length", messages.length);

                for (const message of messages) {
                    const stringMessage = message.value.toString();
                    const { DEPLOYMENT_ID, log } = JSON.parse(stringMessage);
                    try {
                        const { query_id } = await client.insert({
                            table: 'log_events',
                            values: [{ event_id: uuidv4(), deployment_id: DEPLOYMENT_ID, log }],
                            format: 'JSONEachRow'
                        });
                        resolveOffset(message.offset);
                        await commitOffsetsIfNecessary(message.offset);
                        await heartbeat();
                    } catch (err) {
                        console.log(err);
                    }    
                }
            },
        });
    } catch (error) {
        console.error("Failed to connect to Kafka:", error);
        process.exit(1);
    }
}

initKafkaConsumer();

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

module.exports = prisma;