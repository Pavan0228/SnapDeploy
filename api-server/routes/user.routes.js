import { Router } from "express";
import {
    getCurrentUser,
    getUserById,
    loginUser,
    logoutUser,
    registerUser,
    githubLogin,
    updateDetails,
    updatedProfilePhoto,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/github-login", githubLogin);
router.get("/logout", verifyJWT, logoutUser);
router.get("/", verifyJWT, getCurrentUser);
router.get("/:userId", verifyJWT, getUserById);
router.patch("/update", verifyJWT, updateDetails);
router.patch("/update-profile-photo", verifyJWT, upload.single("profilePhoto"), updatedProfilePhoto);

export default router;
