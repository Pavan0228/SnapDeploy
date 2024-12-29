import express, { json, urlencoded } from "express";
import { initKafkaConsumer } from "./services/kafka.service.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookieParser());

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

initKafkaConsumer();

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

export default app;