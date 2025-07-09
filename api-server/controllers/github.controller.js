import { User } from "../models/user.model.js";
import { GitHubService } from "../services/github.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";

export const getGitHubAuthURL = asyncHandler(async (req, res) => {
    try {
        const authURL = GitHubService.generateAuthURL();

        res.status(200).json({
            success: true,
            authURL,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate GitHub auth URL",
            error: error.message,
        });
    }
});

export const handleGitHubCallback = asyncHandler(async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Authorization code is required",
            });
        }

        // Exchange code for access token
        const tokenData = await GitHubService.exchangeCodeForToken(code);

        // Get GitHub user info
        const githubUser = await GitHubService.getGitHubUserInfo(
            tokenData.accessToken
        );

        // Update user with GitHub information
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Encrypt and store GitHub tokens
        user.githubId = githubUser.id.toString();
        user.githubUsername = githubUser.username;
        user.githubAccessToken = GitHubService.encryptToken(
            tokenData.accessToken
        );
        user.isGithubConnected = true;

        if (tokenData.refreshToken) {
            user.githubRefreshToken = GitHubService.encryptToken(
                tokenData.refreshToken
            );
        }

        if(!user.profilePhoto) {
            user.profilePhoto = githubUser.avatarUrl || null;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "GitHub account connected successfully",
            user: {
                githubUsername: githubUser.username,
                isGithubConnected: true,
            },
        });
    } catch (error) {
        console.error("GitHub callback error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to connect GitHub account",
            error: error.message,
        });
    }
});

export const getUserGitHubRepos = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        console.log("Fetching GitHub repos for user:", {
            userId: user._id,
            isGithubConnected: user.isGithubConnected,
            hasGithubAccessToken: !!user.githubAccessToken,
            githubUsername: user.githubUsername,
        });

        if (!user.isGithubConnected || !user.githubAccessToken) {
            return res.status(400).json({
                success: false,
                message: "GitHub account not connected",
            });
        }

        let accessToken;
        try {
            // Try to decrypt the token
            accessToken = GitHubService.decryptToken(user.githubAccessToken);
        } catch (decryptError) {
            console.log(
                "Decryption failed, checking if token is already plain text..."
            );
            // If decryption fails, the token might be stored as plain text (from old auth flow)
            // Let's try to use it directly and then re-encrypt it
            try {
                // Test if the stored token is a valid GitHub token by making a simple API call
                const testResponse = await axios.get(
                    "https://api.github.com/user",
                    {
                        headers: {
                            Authorization: `Bearer ${user.githubAccessToken}`,
                            "User-Agent": "SnapDeploy-App",
                        },
                    }
                );

                console.log("Token is valid plain text, re-encrypting...");
                accessToken = user.githubAccessToken;

                // Re-encrypt and save the token
                user.githubAccessToken =
                    GitHubService.encryptToken(accessToken);
                await user.save();
                console.log("Token re-encrypted and saved successfully");
            } catch (testError) {
                console.error("Token is invalid:", testError.message);
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid GitHub token. Please reconnect your GitHub account.",
                });
            }
        }

        console.log(
            "Decrypted GitHub access token:",
            accessToken ? "present" : "missing"
        );

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.per_page) || 30;

        const repositories = await GitHubService.getUserRepositories(
            accessToken,
            page,
            perPage
        );

        console.log("Fetched repositories count:", repositories.length);

        res.status(200).json({
            success: true,
            data: repositories,
            pagination: {
                page,
                perPage,
                hasMore: repositories.length === perPage,
            },
        });
    } catch (error) {
        console.error("Error fetching user repositories:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch repositories",
            error: error.message,
        });
    }
});

export const getRepositoryBranches = asyncHandler(async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const user = await User.findById(req.user._id);

        if (!user.isGithubConnected || !user.githubAccessToken) {
            return res.status(400).json({
                success: false,
                message: "GitHub account not connected",
            });
        }

        const accessToken = GitHubService.decryptToken(user.githubAccessToken);
        const branches = await GitHubService.getRepositoryBranches(
            accessToken,
            owner,
            repo
        );

        res.status(200).json({
            success: true,
            data: branches,
        });
    } catch (error) {
        console.error("Error fetching repository branches:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch repository branches",
            error: error.message,
        });
    }
});

export const disconnectGitHub = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Clear GitHub-related fields
        user.githubId = undefined;
        user.githubUsername = undefined;
        user.githubAccessToken = undefined;
        user.githubRefreshToken = undefined;
        user.isGithubConnected = false;

        await user.save();

        res.status(200).json({
            success: true,
            message: "GitHub account disconnected successfully",
        });
    } catch (error) {
        console.error("Error disconnecting GitHub:", error);
        res.status(500).json({
            success: false,
            message: "Failed to disconnect GitHub account",
            error: error.message,
        });
    }
});

export const getGitHubConnectionStatus = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "isGithubConnected githubUsername"
        );

        res.status(200).json({
            success: true,
            data: {
                isConnected: user.isGithubConnected || false,
                username: user.githubUsername || null,
            },
        });
    } catch (error) {
        console.error("Error checking GitHub connection status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check GitHub connection status",
            error: error.message,
        });
    }
});
