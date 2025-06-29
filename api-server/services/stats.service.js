import { Project } from "../models/project.model.js";
import { Deployment, DeploymentStatus } from "../models/deployment.model.js";

export class StatsService {
    static async getUserProjectStats(userId) {
        const totalProjects = await Project.countDocuments({ owner: userId });

        const projects = await Project.find({ owner: userId }).populate(
            "deployments"
        );

        return {
            totalProjects,
            projects,
        };
    }

    static async getActiveDeploymentStats(projects) {
        let activeDeployments = 0;
        let inProgressDeployments = 0;
        let failedDeployments = 0;

        projects.forEach((project) => {
            if (project.deployments && project.deployments.length > 0) {
                project.deployments.forEach((deployment) => {
                    switch (deployment.status) {
                        case DeploymentStatus.READY:
                            activeDeployments++;
                            break;
                        case DeploymentStatus.IN_PROGRESS:
                            inProgressDeployments++;
                            break;
                        case DeploymentStatus.FAILED:
                            failedDeployments++;
                            break;
                    }
                });
            }
        });

        return {
            activeDeployments,
            inProgressDeployments,
            failedDeployments,
        };
    }

    static async getRecentActivity(userId) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const recentProjects = await Project.countDocuments({
            owner: userId,
            createdAt: { $gte: oneWeekAgo },
        });

        const userProjects = await Project.find({ owner: userId }, "_id");
        const projectIds = userProjects.map((p) => p._id);

        const recentDeployments = await Deployment.countDocuments({
            projectId: { $in: projectIds },
            createdAt: { $gte: oneDayAgo },
        });

        return {
            recentProjects,
            recentDeployments,
        };
    }

    static calculateUptime(activeDeployments, totalDeployments) {
        if (totalDeployments === 0) return 100.0;
        return (
            Math.round((activeDeployments / totalDeployments) * 100 * 100) / 100
        );
    }

    static generateMockVisitorData() {
        // In a real application, this would connect to analytics services
        // like Google Analytics, Mixpanel, or your own tracking system
        return {
            totalVisitors: 1,
            monthlyGrowth: "+12%",
        };
    }

    static formatStatsResponse(data) {
        const {
            totalProjects,
            activeDeployments,
            inProgressDeployments,
            recentProjects,
            recentDeployments,
            totalVisitors,
            uptime,
        } = data;

        return {
            totalProjects: {
                value: totalProjects,
                change:
                    recentProjects > 0
                        ? `+${recentProjects} this week`
                        : "No new projects this week",
                trend: recentProjects > 0 ? "up" : "stable",
            },
            activeDeployments: {
                value: activeDeployments,
                change:
                    recentDeployments > 0
                        ? `+${recentDeployments} today`
                        : "No new deployments today",
                trend: recentDeployments > 0 ? "up" : "stable",
            },
            totalVisitors: {
                value: totalVisitors,
                change: "+12% this month", // Mock data
                trend: "up",
            },
            uptime: {
                value: `${uptime}%`,
                change: "Last 30 days",
                trend: "stable",
            },
            inProgressDeployments: {
                value: inProgressDeployments,
                change: "Currently building",
                trend: inProgressDeployments > 0 ? "building" : "stable",
            },
        };
    }
}
