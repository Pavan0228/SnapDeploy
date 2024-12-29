import { Router } from "express";
import { getLogs } from "../controllers/logs.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();
router.get("/:id", verifyJWT, getLogs);

export default router;
