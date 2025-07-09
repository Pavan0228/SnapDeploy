import { Octokit } from "@octokit/rest";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

const ENCRYPTION_KEY =
    process.env.GITHUB_TOKEN_ENCRYPTION_KEY || "default-key-change-this";

export class GitHubService {
    static encryptToken(token) {
        try {
            console.log("Encrypting token:", token ? "present" : "missing");
            if (!token) {
                throw new Error("No token provided for encryption");
            }
            const encrypted = CryptoJS.AES.encrypt(
                token,
                ENCRYPTION_KEY
            ).toString();
            console.log("Encryption result:", encrypted ? "success" : "failed");
            return encrypted;
        } catch (error) {
            console.error("Error encrypting token:", error);
            throw new Error("Failed to encrypt GitHub token");
        }
    }

    static decryptToken(encryptedToken) {
        try {
            console.log(
                "Decrypting token:",
                encryptedToken ? "present" : "missing"
            );
            console.log(
                "Encrypted token length:",
                encryptedToken ? encryptedToken.length : 0
            );
            console.log(
                "Encryption key:",
                ENCRYPTION_KEY ? "present" : "missing"
            );

            if (!encryptedToken) {
                throw new Error("No encrypted token provided");
            }

            const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);

            console.log("Decryption result:", decrypted ? "success" : "failed");
            console.log(
                "Decrypted token length:",
                decrypted ? decrypted.length : 0
            );

            if (!decrypted) {
                throw new Error("Decryption resulted in empty string");
            }

            return decrypted;
        } catch (error) {
            console.error("Error decrypting token:", error);
            throw new Error("Failed to decrypt GitHub token");
        }
    }

    static createOctokit(accessToken) {
        return new Octokit({
            auth: accessToken,
        });
    }

    static async getUserRepositories(accessToken, page = 1, perPage = 30) {
        try {
            console.log(
                "GitHubService: Fetching repositories with token:",
                accessToken ? "present" : "missing"
            );
            const octokit = this.createOctokit(accessToken);

            const { data } = await octokit.rest.repos.listForAuthenticatedUser({
                sort: "updated",
                direction: "desc",
                per_page: perPage,
                page: page,
                type: "all",
            });

            console.log(
                "GitHubService: Successfully fetched repositories, count:",
                data.length
            );

            return data.map((repo) => ({
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                private: repo.private,
                htmlUrl: repo.html_url,
                cloneUrl: repo.clone_url,
                defaultBranch: repo.default_branch,
                language: repo.language,
                updatedAt: repo.updated_at,
                size: repo.size,
            }));
        } catch (error) {
            console.error(
                "GitHubService: Error fetching GitHub repositories:",
                error
            );
            console.error("GitHubService: Error status:", error.status);
            console.error("GitHubService: Error message:", error.message);
            throw new Error("Failed to fetch repositories from GitHub");
        }
    }

    static async getRepositoryBranches(accessToken, owner, repo) {
        try {
            const octokit = this.createOctokit(accessToken);

            const { data } = await octokit.rest.repos.listBranches({
                owner,
                repo,
            });

            return data.map((branch) => ({
                name: branch.name,
                sha: branch.commit.sha,
                protected: branch.protected,
            }));
        } catch (error) {
            console.error("Error fetching repository branches:", error);
            throw new Error("Failed to fetch repository branches");
        }
    }

    static async verifyRepositoryAccess(accessToken, owner, repo) {
        try {
            const octokit = this.createOctokit(accessToken);

            const { data } = await octokit.rest.repos.get({
                owner,
                repo,
            });

            return {
                hasAccess: true,
                repository: {
                    id: data.id,
                    name: data.name,
                    fullName: data.full_name,
                    private: data.private,
                    defaultBranch: data.default_branch,
                    cloneUrl: data.clone_url,
                },
            };
        } catch (error) {
            if (error.status === 404) {
                return {
                    hasAccess: false,
                    error: "Repository not found or access denied",
                };
            }
            throw error;
        }
    }

    static async getGitHubUserInfo(accessToken) {
        try {
            const octokit = this.createOctokit(accessToken);

            const { data } = await octokit.rest.users.getAuthenticated();

            return {
                id: data.id,
                username: data.login,
                name: data.name,
                email: data.email,
                avatarUrl: data.avatar_url,
            };
        } catch (error) {
            console.error("Error fetching GitHub user info:", error);
            throw new Error("Failed to fetch GitHub user information");
        }
    }

    static generateAuthURL() {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const redirectUri = process.env.GITHUB_REDIRECT_URI;
        const scope = "repo,user:email";
        const state = Math.random().toString(36).substring(7); // Add random state for security

        console.log("Generating GitHub auth URL...");

        return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&scope=${scope}&response_type=code&state=${state}`;
    }

    static async exchangeCodeForToken(code) {
        try {
            console.log(process.env.GITHUB_CLIENT_ID);

            const response = await fetch(
                "https://github.com/login/oauth/access_token",
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        client_id: process.env.GITHUB_CLIENT_ID,
                        client_secret: process.env.GITHUB_CLIENT_SECRET,
                        code: code,
                    }),
                }
            );

            const data = await response.json();

            if (data.error) {
                throw new Error(
                    data.error_description ||
                        "Failed to exchange code for token"
                );
            }

            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                scope: data.scope,
            };
        } catch (error) {
            console.error("Error exchanging code for token:", error);
            throw new Error("Failed to authenticate with GitHub");
        }
    }
}
