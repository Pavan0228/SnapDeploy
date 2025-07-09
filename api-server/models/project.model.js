import mongoose from "mongoose";

const projectScheme = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        gitURL: {
            type: String,
            required: true,
        },
        githubRepoId: {
            type: String,
        },
        githubBranch: {
            type: String,
            default: "main",
        },
        isPrivateRepo: {
            type: Boolean,
            default: false,
        },
        repoAccessToken: {
            type: String, // Store encrypted token for private repos
        },
        subdomain: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        customDomain: {
            type: String,
            required: false,
        },
        frontendPath: {
            type: String,
            required: false,
            default: "./",
            trim: true,
        },
        envVariables: {
            type: Map,
            of: String,
            default: new Map(),
        },
        deployments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Deployment",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Project = mongoose.model("Project", projectScheme);
