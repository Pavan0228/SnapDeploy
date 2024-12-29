import { Router } from "express";
import { createDeployment, getDeploymentStatus } from "../controllers/deployment.controller.js";

const router = Router();
router.post("/", createDeployment);
router.get("/:id", getDeploymentStatus);

export default router;