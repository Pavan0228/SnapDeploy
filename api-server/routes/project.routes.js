import { Router } from "express";
import {
    createProject,
    getProjectById,
    getUserAllProjects,
    getRecentProjects,
} from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.post("/", verifyJWT, createProject);
router.get("/", verifyJWT, getUserAllProjects);
router.get("/recent", verifyJWT, getRecentProjects);
router.get("/:projectId", verifyJWT, getProjectById);

export default router;
