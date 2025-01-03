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
        subdomain: {
            type: String,
            required: true,
            unique: true,
        },
        customDomain: {
            type: String,
            required: false,
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
