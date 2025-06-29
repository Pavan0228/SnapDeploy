import { Project } from "../models/project.model.js";
import { Deployment, DeploymentStatus } from "../models/deployment.model.js";
import { StatsService } from "../services/stats.service.js";

export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user project stats
        const { totalProjects, projects } =
            await StatsService.getUserProjectStats(userId);

        // Get deployment stats
        const { activeDeployments, inProgressDeployments } =
            await StatsService.getActiveDeploymentStats(projects);

        // Get recent activity
        const { recentProjects, recentDeployments } =
            await StatsService.getRecentActivity(userId);

        // Calculate uptime
        const totalDeployments = projects.reduce(
            (acc, project) => acc + (project.deployments?.length || 0),
            0
        );
        const uptime = StatsService.calculateUptime(
            activeDeployments,
            totalDeployments
        );

        // Get visitor data (mock for now)
        const { totalVisitors } = StatsService.generateMockVisitorData();

        // Format response
        const stats = StatsService.formatStatsResponse({
            totalProjects,
            activeDeployments,
            inProgressDeployments,
            recentProjects,
            recentDeployments,
            totalVisitors,
            uptime,
        });

        return res.status(200).json({
            status: "success",
            data: stats,
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch statistics",
            error: error.message,
        });
    }
};

export const getGlobalStats = async (req, res) => {
    try {
        // Global statistics (requires admin access or public endpoint)
        const totalProjects = await Project.countDocuments();
        const totalDeployments = await Deployment.countDocuments();
        const activeDeployments = await Deployment.countDocuments({
            status: DeploymentStatus.READY,
        });

        const globalStats = {
            totalProjects,
            totalDeployments,
            activeDeployments,
            successRate:
                totalDeployments > 0
                    ? Math.round((activeDeployments / totalDeployments) * 100)
                    : 0,
        };

        return res.status(200).json({
            status: "success",
            data: globalStats,
        });
    } catch (error) {
        console.error("Error fetching global stats:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch global statistics",
            error: error.message,
        });
    }
};
