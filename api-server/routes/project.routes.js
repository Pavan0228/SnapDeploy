import { Router } from "express";
import { createProject } from "../controllers/project.controller.js";

const router = Router();
router.post("/", createProject);

export default router;