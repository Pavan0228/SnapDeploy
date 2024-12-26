const express = require("express");
const dotenv = require("dotenv");
const { generateSlug } = require("random-word-slugs");
const { ECSClient , RunTaskCommand } = require("@aws-sdk/client-ecs")

dotenv.config({
    path: "./.env",
});

const app = express();
const port = process.env.PORT || 9000;

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})


const config = {
    CLUSTER: process.env.ECS_CLUSTER_NAME,
    TASK: process.env.ECS_TASK_DEFINITION,
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/projects", async (req, res) => {
    const { githubUrl } = req.body;
    const projectSlug = generateSlug();

    //spin up a new ECS task

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: "FARGATE",
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: ["subnet-0615a4578ea7942d1","subnet-0a0a1225f19c481f1","subnet-0d64dd757f3946666"],
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
                            value: projectSlug,
                        },
                        {
                            name: "GIT_REPOSITORY__URL",
                            value: githubUrl,
                        },
                    ],
                },
            ],
        },
    }) 

    await ecsClient.send(command).then((data) => {
        console.log(data);
    }).catch((error) => {
        console.log(error);
    })

    return res
        .status(201)
        .json({
            projectSlug,
            "url": `http://${projectSlug}.localhost:8000`,
        });

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
