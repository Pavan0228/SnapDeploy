const express = require("express");
const httpProxy = require("http-proxy");
const dotenv = require("dotenv");
const prisma = require("../api-server/index.js");

// Load environment variables from .env file
dotenv.config({
    path: ".env",
});

const app = express();

const port = process.env.PORT || 8000;

const BASE_URL = process.env.BASE_URL;

const proxy = httpProxy.createProxy({});

app.use(async (req, res) => {
    const hostName = req.hostname;
    const subDomain = hostName.split(".")[0];

    const project = await prisma.project.findUnique({
        where: {
            subdomain: subDomain,
        },
    });

    if (!project) {
        return res.status(404).send("Project not found");
    }

    const resolvesTo = BASE_URL + project.id;

    return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
    const url = req.url;
    if (url === "/") {
        proxyReq.path += "index.html";
    }
    return proxyReq;
});

app.listen(port, function () {
    console.log("Reverse proxy is running on port " + port);
});
