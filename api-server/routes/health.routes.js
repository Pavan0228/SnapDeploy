import { Router } from "express";
import {
    healthCheck,
    readinessCheck,
} from "../controllers/health.controller.js";

const router = Router();

// Health check endpoint
router.get("/health", healthCheck);

// Readiness check endpoint
router.get("/ready", readinessCheck);

export default router;
