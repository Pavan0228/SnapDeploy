import { Router } from "express";
import { getLogs, streamLogs } from "../controllers/logs.controller.js";
import { verifyJWT, verifyJWTForSSE } from "../middlewares/auth.middlewares.js";

const router = Router();
router.get("/:id", verifyJWT, getLogs);
router.get("/:id/stream", verifyJWTForSSE, streamLogs);

export default router;
