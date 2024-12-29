import { Deployment, DeploymentStatus } from "../models/deployment.model.js";
import { Project } from "../models/project.model.js";
import { startECSTask } from "../services/ecs.service.js";

export const createDeployment = async (req, res) => {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({
            error: "Project not found",
        });
    }

    const deployment = new Deployment({
        projectId: project._id,
        status: DeploymentStatus.QUEUED
    });
    
    await deployment.save();

    project.deployments.push(deployment._id);
    await project.save();

    try {
        await startECSTask(project, deployment);

        deployment.status = DeploymentStatus.IN_PROGRESS;
        await deployment.save();

        return res.status(201).json({
            status: "STARTED",
            data: { deploymentId: deployment._id },
            message: "Deployment started",
        });
    } catch (error) {
        console.error("Failed to start deployment:", error);
        deployment.status = DeploymentStatus.FAILED;
        await deployment.save();
        
        return res.status(500).json({
            error: "Failed to start build task",
            message: error.message,
        });
    }
};


export const getDeploymentStatus = async (req, res) => {
    try {
        const { deploymentId } = req.params;
        
        const deployment = await Deployment.findById(deploymentId)
            .populate('project', 'name gitURL');

        if (!deployment) {
            return res.status(404).json({
                error: "Deployment not found"
            });
        }

        return res.status(200).json({
            status: "success",
            data: {
                deploymentId: deployment._id,
                status: deployment.status,
                project: deployment.projectId,
            }
        });
    } catch (error) {
        console.error("Error in getDeploymentStatus:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
};

