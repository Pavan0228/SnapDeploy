import { Router } from "express";
import {
    getGitHubAuthURL,
    handleGitHubCallback,
    getUserGitHubRepos,
    getRepositoryBranches,
    disconnectGitHub,
    getGitHubConnectionStatus,
} from "../controllers/github.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// GitHub OAuth routes
router.get("/auth-url", getGitHubAuthURL); // Remove auth requirement for getting auth URL
router.post("/callback", verifyJWT, handleGitHubCallback);
router.get("/status", verifyJWT, getGitHubConnectionStatus);
router.post("/disconnect", verifyJWT, disconnectGitHub);

// GitHub API routes
router.get("/repositories", verifyJWT, getUserGitHubRepos);
router.get(
    "/repositories/:owner/:repo/branches",
    verifyJWT,
    getRepositoryBranches
);

export default router;
