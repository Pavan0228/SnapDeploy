import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

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

export const startECSTask = async (project, deployment) => {
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
                            value: project._id.toString(),
                        },
                        {
                            name: "GIT_REPOSITORY__URL",
                            value: project.gitURL,
                        },
                        {
                            name: "DEPLOYMENT_ID",
                            value: deployment._id.toString(),
                        },
                        {
                            name: "FRONTEND_PATH",
                            value: project.frontendPath || "./",
                        },
                        // Add user-defined environment variables
                        ...(project.envVariables
                            ? Array.from(project.envVariables.entries()).map(
                                  ([key, value]) => ({
                                      name: key,
                                      value: value,
                                  })
                              )
                            : []),
                    ],
                },
            ],
        },
    });

    const { tasks } = await ecsClient.send(command);

    if (!tasks || tasks.length === 0) {
        throw new Error("Failed to start task");
    }

    return tasks[0];
};
