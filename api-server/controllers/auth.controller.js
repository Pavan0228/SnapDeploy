import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GitHubService } from "../services/github.service.js";
import axios from "axios";

// Simple in-memory cache to prevent duplicate code usage
const processedCodes = new Set();

// Clean up processed codes every 10 minutes (GitHub codes expire quickly anyway)
setInterval(() => {
    processedCodes.clear();
}, 10 * 60 * 1000);

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;

    // Check if all fields are provided
    if (
        !fullName?.trim() ||
        !email?.trim() ||
        !password?.trim() ||
        !username?.trim()
    ) {
        res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400).json({ message: "User already exists" });
    }

    // Create the new user
    const user = await User.create({ fullName, email, password, username });

    if (!user) {
        res.status(400).json({ message: "User registration failed" });
    }

    // Generate tokens after successful registration
    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    // Remove sensitive fields before sending response
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    // Set cookies options
    const options = {
        httpOnly: true,
        secure: true,
    };

    // Send response with cookies and tokens
    return res
        .status(201)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json({
            message: "User registered successfully",
            user: userData,
            accessToken,
        });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
        res.status(400).json({ message: "All fields are required" });
    }

    let user;
    if (email) {
        user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Email not found" });
        }
    } else if (username) {
        user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({ message: "Username not found" });
        }
    }

    const isPasswordCorrect = await user.checkPassword(password);

    if (!isPasswordCorrect) {
        res.status(401).json({ message: "Invalid password" });
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json({
            message: "User logged in successfully",
            user: userData,
            accessToken,
        });
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json({
            message: "User logged out successfully",
        });
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );
    res.status(200).json(user);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).select(
        "-password -refreshToken"
    );
    res.status(200).json(user);
});

// GitHub OAuth login
const githubLogin = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res
            .status(400)
            .json({ message: "GitHub authorization code is required" });
    }

    // Check if this code has already been processed
    if (processedCodes.has(code)) {
        return res.status(400).json({
            message: "GitHub authorization code has already been used",
        });
    }

    // Add code to processed set immediately to prevent duplicate processing
    processedCodes.add(code);

    try {
        console.log(
            "GitHub login attempt with code:",
            code ? "present" : "missing"
        );

        // Exchange code for access token
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
            },
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;

        if (!access_token) {
            console.error("No access token received:", tokenResponse.data);
            return res
                .status(400)
                .json({ message: "Failed to get GitHub access token" });
        }

        console.log("Access token received, fetching user info...");
        // Get user info from GitHub
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "User-Agent": "SnapDeploy-App",
            },
        });

        console.log("GitHub user info received:", {
            id: userResponse.data.id,
            login: userResponse.data.login,
        });

        const githubUser = userResponse.data;

        // Get user's email if not provided in profile (for private emails)
        let userEmail = githubUser.email;
        if (!userEmail) {
            try {
                const emailResponse = await axios.get(
                    "https://api.github.com/user/emails",
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            "User-Agent": "SnapDeploy-App",
                        },
                    }
                );
                const emails = emailResponse.data;
                const primaryEmail = emails.find((email) => email.primary);
                userEmail = primaryEmail
                    ? primaryEmail.email
                    : `${githubUser.login}@github.local`;
            } catch (emailError) {
                console.warn("Could not fetch user email:", emailError.message);
                userEmail = `${githubUser.login}@github.local`;
            }
        }

        // Check if user already exists with this GitHub ID
        let user = await User.findOne({ githubId: githubUser.id.toString() });

        if (user) {
            // Update existing user's GitHub data
            console.log("Encrypting GitHub access token for existing user...");
            user.githubAccessToken = GitHubService.encryptToken(access_token);
            if(refresh_token){
                user.githubRefreshToken = GitHubService.encryptToken(refresh_token);
            }
            user.githubUsername = githubUser.login;
            user.isGithubConnected = true;
            user.profilePhoto = githubUser.avatar_url;
            await user.save();
            console.log("User updated successfully with encrypted token");
        } else {
            // Check if user exists with the same email
            const existingEmailUser = await User.findOne({
                email: userEmail,
            });

            if (existingEmailUser) {
                // Link GitHub to existing account
                console.log(
                    "Encrypting GitHub access token for existing email user..."
                );
                existingEmailUser.githubId = githubUser.id.toString();
                existingEmailUser.githubUsername = githubUser.login;
                existingEmailUser.githubAccessToken =
                    GitHubService.encryptToken(access_token);
                existingEmailUser.isGithubConnected = true;
                existingEmailUser.profilePhoto = githubUser.avatar_url;
                await existingEmailUser.save();
                user = existingEmailUser;
                console.log(
                    "Existing email user updated successfully with encrypted token"
                );
            } else {
                // Check if username already exists and generate a unique one if needed
                let username = githubUser.login;
                let existingUsernameUser = await User.findOne({ username });
                let counter = 1;

                while (existingUsernameUser) {
                    username = `${githubUser.login}${counter}`;
                    existingUsernameUser = await User.findOne({ username });
                    counter++;
                }

                // Create new user
                console.log("Encrypting GitHub access token for new user...");
                user = await User.create({
                    fullName: githubUser.name || githubUser.login,
                    email: userEmail,
                    username: username,
                    password: `github_${githubUser.id}_${Date.now()}`, // Generate a random password
                    githubId: githubUser.id.toString(),
                    githubUsername: githubUser.login,
                    githubAccessToken: GitHubService.encryptToken(access_token),
                    isGithubConnected: true,
                    profilePhoto: githubUser.avatar_url,
                });
                console.log(
                    "New user created successfully with encrypted token"
                );
            }
        }

        // Generate tokens
        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshToken(user._id);

        const userData = user.toObject();
        delete userData.password;
        delete userData.refreshToken;

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({
                message: "GitHub login successful",
                user: userData,
                accessToken,
            });
    } catch (error) {
        console.error("GitHub login error:", error);

        // Remove code from processed set on error so it can be retried
        processedCodes.delete(code);

        // More specific error handling
        if (error.response?.status === 401) {
            return res.status(401).json({
                message:
                    "GitHub authentication failed. Invalid or expired authorization code.",
                error: "Invalid GitHub credentials",
            });
        } else if (error.response?.status === 403) {
            return res.status(403).json({
                message: "GitHub API rate limit exceeded or access forbidden.",
                error: "GitHub API access forbidden",
            });
        } else if (error.code === "ERR_BAD_REQUEST") {
            return res.status(400).json({
                message: "Invalid request to GitHub API.",
                error: error.response?.data || error.message,
            });
        }

        return res.status(500).json({
            message: "GitHub login failed",
            error: error.response?.data || error.message,
        });
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getUserById,
    githubLogin,
};
