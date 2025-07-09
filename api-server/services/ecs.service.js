import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { GitHubService } from "./github.service.js";
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
    // Prepare environment variables
    const environmentVars = [
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
    ];

    // Add GitHub access token for private repositories
    if (project.isPrivateRepo && project.repoAccessToken) {
        const decryptedToken = GitHubService.decryptToken(
            project.repoAccessToken
        );
        environmentVars.push({
            name: "GITHUB_ACCESS_TOKEN",
            value: decryptedToken,
        });
        environmentVars.push({
            name: "IS_PRIVATE_REPO",
            value: "true",
        });
    }

    // Add GitHub branch
    if (project.githubBranch) {
        environmentVars.push({
            name: "GITHUB_BRANCH",
            value: project.githubBranch,
        });
    }

    // Add user-defined environment variables
    if (project.envVariables) {
        const userEnvVars = Array.from(project.envVariables.entries()).map(
            ([key, value]) => ({
                name: key,
                value: value,
            })
        );
        environmentVars.push(...userEnvVars);
    }

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
                    environment: environmentVars,
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
