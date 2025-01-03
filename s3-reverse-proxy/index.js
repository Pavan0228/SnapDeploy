const express = require("express");
const httpProxy = require("http-proxy");
const dotenv = require("dotenv");
const { Project } = require("./model/project.model");
const { connectDB } = require("./config/index");
const cors = require("cors");


// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const BASE_URL = process.env.BASE_URL;

// Create proxy instance with error handling
const proxy = httpProxy.createProxy({
    proxyTimeout: 3000,
    timeout: 3000,
    xfwd: true,
    headers: {
        'X-Frame-Options': 'ALLOWALL'
    }
});

// Cache for project lookups
const projectCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getProject(subdomain) {
    const cached = projectCache.get(subdomain);
    if (cached && cached.timestamp > Date.now() - CACHE_DURATION) {
        return cached.project;
    }

    const project = await Project.findOne({ subdomain }).lean();
    if (project) {
        projectCache.set(subdomain, {
            project,
            timestamp: Date.now()
        });
    }

    return project;
}

app.use(cors({ origin: "*" }));

app.use((req, res, next) => {
    res.header('X-Frame-Options', 'ALLOWALL');
    res.header('Content-Security-Policy', 'frame-ancestors *');
    next();
});

// Main proxy middleware
app.use(async (req, res) => {
    try {
        const subdomain = req.hostname.split(".")[0];
        const project = await getProject(subdomain);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const target = `${BASE_URL}${project._id}`;
        proxy.web(req, res, { target, changeOrigin: true });

    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Handle proxy paths
proxy.on("proxyReq", (proxyReq, req) => {
    if (req.url === "/") {
        proxyReq.path += "index.html";
    }
});

// Error handling for proxy
proxy.on("error", (err, req, res) => {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Bad gateway" });
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("Received SIGTERM, shutting down...");
    proxy.close();
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`⚙️ Reverse proxy running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error(`❌ Failed to start: ${error.message}`);
        process.exit(1);
    }
}

startServer();