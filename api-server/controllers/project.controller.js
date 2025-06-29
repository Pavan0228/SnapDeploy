import { z } from "zod";
import { generateSlug } from "random-word-slugs";
import { Project } from "../models/project.model.js";

export const createProject = async (req, res) => {
    const projectSchema = z.object({
        name: z.string(),
        gitURL: z
            .string()
            .url()
            .regex(/^https?:\/\/github\.com\/[\w-]+\/[\w-]+$/),
        slug: z.string().optional(),
        frontendPath: z.string().optional().default("./"),
        envVariables: z.record(z.string()).optional().default({}),
    });

    const safeParse = projectSchema.safeParse(req.body);

    if (!safeParse.success) {
        return res.status(400).json({
            error: "Invalid request body",
            details: safeParse.error.errors,
        });
    }

    const { name, gitURL, slug, frontendPath, envVariables } = safeParse.data;

    try {
        const existingProject = await Project.findOne({
            owner: req.user._id,
            gitURL,
        });

        if (existingProject) {
            return res.status(201).json({
                status: "success",
                data: existingProject,
            });
        }

        const subdomain = slug || generateSlug();
        const project = new Project({
            name,
            gitURL,
            subdomain,
            owner: req.user._id,
            frontendPath: frontendPath || "./",
            envVariables: new Map(Object.entries(envVariables || {})),
        });

        await project.save();

        return res.status(201).json({
            status: "success",
            data: project,
        });
    } catch (error) {
        console.error("Failed to create project:", error);
        return res.status(500).json({
            error: "Failed to create project",
            message: error.message,
        });
    }
};

export const getUserAllProjects = async (req, res) => {
    const userId = req.user._id;

    try {
        const projects = await Project.find({ owner: userId }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            status: "success",
            data: projects,
        });
    } catch (error) {
        console.error("Failed to get user projects:", error);
        return res.status(500).json({
            error: "Failed to get user projects",
            message: error.message,
        });
    }
};

export const getProjectById = async (req, res) => {
    const userId = req.user._id;
    const projectId = req.params.projectId;
    try {
        const project = await Project.findOne({
            _id: projectId,
            owner: userId,
        });

        if (!project) {
            return res.status(404).json({
                error: "Project not found",
            });
        }

        return res.status(200).json({
            status: "success",
            data: project,
        });
    } catch (error) {
        console.error("Failed to get project by id:", error);
        return res.status(500).json({
            error: "Failed to get project by id",
            message: error.message,
        });
    }
};

export const getRecentProjects = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get the 3 most recent projects for the user
        const recentProjects = await Project.find({ owner: userId })
            .sort({ updatedAt: -1 })
            .limit(3)
            .select("name status deployedAt url updatedAt subdomain");

        const formattedProjects = recentProjects.map((project) => ({
            name: project.name,
            status: project.status || "Active",
            deployed: formatTimeAgo(project.deployedAt || project.updatedAt),
            url:`${project.subdomain}.snapdeploy.me`,
        }));

        res.status(200).json({
            success: true,
            data: formattedProjects,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent projects",
            error: error.message,
        });
    }
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) return `${diffInSecs} second${diffInSecs !== 1 ? "s" : ""} ago`;
    if (diffInMins < 60) return `${diffInMins} minute${diffInMins !== 1 ? "s" : ""} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    return `${Math.floor(diffInDays / 7)} week${
        Math.floor(diffInDays / 7) !== 1 ? "s" : ""
    } ago`;
};
