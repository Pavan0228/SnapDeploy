import express, { json, urlencoded } from "express";
import { initKafkaConsumer } from "./services/kafka.service.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookieParser());

const buildPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(buildPath));

// Routes
app.get("/", (req, res) => {
    res.send("api Server is running");
});

// Routes
import authRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import deploymentRoutes from "./routes/deployment.routes.js";
import logsRoutes from "./routes/logs.routes.js";


app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/deployments", deploymentRoutes);
app.use("/api/v1/logs", logsRoutes);


app.get("/*", function (req, res) {
    res.sendFile(
        path.join(__dirname, "../frontend/dist/index.html"),
        function (err) {
            if (err) {
                res.status(500).send(err);
            }
        }
    );
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

initKafkaConsumer();

export default app;