import { z } from "zod";
import { generateSlug } from "random-word-slugs";
import { Project } from "../models/project.model.js";

export const createProject = async (req, res) => {
    const projectSchema = z.object({
        name: z.string(),
        gitURL: z.string(),
    });

    const safeParse = projectSchema.safeParse(req.body);

    if (!safeParse.success) {
        return res.status(400).json({
            error: "Invalid request body",
            details: safeParse.error.errors,
        });
    }

    const { name, gitURL } = safeParse.data;

    try {
        const project = new Project({
            name,
            gitURL,
            subdomain: generateSlug(),
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