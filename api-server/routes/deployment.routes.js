import { Router } from "express";
import { createDeployment, getDeploymentStatus } from "../controllers/deployment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();
router.post("/", verifyJWT, createDeployment);
router.get("/:id", verifyJWT, getDeploymentStatus);

export default router;