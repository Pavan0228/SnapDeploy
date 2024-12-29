import mongoose from "mongoose";

export const DeploymentStatus = {
    NOT_STARTED: 'NOT_STARTED',
    QUEUED: 'QUEUED',
    IN_PROGRESS: 'IN_PROGRESS',
    READY: 'READY',
    FAILED: 'FAILED'
};


const deploymentScheme = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        status: {
            type: String,
            enum: Object.values(DeploymentStatus),
            default: DeploymentStatus.NOT_STARTED
        }
    },
    {
        timestamps: true,
    }
)

export const Deployment = mongoose.model("Deployment", deploymentScheme);