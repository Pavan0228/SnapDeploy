import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/signup" , registerUser);
router.post("/login" , loginUser);
router.get("/logout" , verifyJWT, logoutUser);

export default router;
