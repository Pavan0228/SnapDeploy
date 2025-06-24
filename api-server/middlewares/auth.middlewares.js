import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new Error(401, "Unauthorized request");
        }

        const decodedToken = await jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?.id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new Error(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new Error(401, error?.message || "Invalid access token");
    }
});

export const verifyJWTForSSE = async (req, res, next) => {
    try {
        const token = req.query.token;

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?.id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return res.status(401).json({ error: "Invalid Access Token" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ error: error?.message || "Invalid access token" });
    }
};
