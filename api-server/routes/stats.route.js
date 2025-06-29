import { Router } from "express";
import {
    getUserStats,
    getGlobalStats,
} from "../controllers/stats.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Get user-specific statistics
router.get("/user", verifyJWT, getUserStats);

// Get global platform statistics (public endpoint)
router.get("/global", getGlobalStats);

export default router;
