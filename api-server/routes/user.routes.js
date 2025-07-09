import { Router } from "express";
import {
    getCurrentUser,
    getUserById,
    loginUser,
    logoutUser,
    registerUser,
    githubLogin,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/github-login", githubLogin);
router.get("/logout", verifyJWT, logoutUser);
router.get("/", verifyJWT, getCurrentUser);
router.get("/:userId", verifyJWT, getUserById);

export default router;
