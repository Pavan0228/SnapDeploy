import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import {
    Zap,
    TrendingUp,
    Activity,
    Users,
    Clock,
    Plus,
    FolderGit2,
    Globe,
    ArrowRight,
} from "lucide-react";
import { BASE_API_SERVER_URL } from "../constant/url";

const Dashboard = () => {
    const navigate = useNavigate();
    const [recentProjects, setRecentProjects] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    const token = Cookies.get("accessToken");

    useEffect(() => {
        fetchRecentProjects();
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const response = await axios.get(
                `${BASE_API_SERVER_URL}/stats/user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                const statsData = response.data.data;
                const formattedStats = [
                    {
                        title: "Total Projects",
                        value: statsData.totalProjects.value.toString(),
                        change: statsData.totalProjects.change,
                        icon: FolderGit2,
                        color: "primary",
                        trend: statsData.totalProjects.trend,
                    },
                    {
                        title: "Active Deployments",
                        value: statsData.activeDeployments.value.toString(),
                        change: statsData.activeDeployments.change,
                        icon: Activity,
                        color: "secondary",
                        trend: statsData.activeDeployments.trend,
                    },
                    {
                        title: "Total Visitors",
                        value: formatNumber(statsData.totalVisitors.value),
                        change: statsData.totalVisitors.change,
                        icon: Users,
                        color: "accent",
                        trend: statsData.totalVisitors.trend,
                    },
                    {
                        title: "Uptime",
                        value: statsData.uptime.value,
                        change: statsData.uptime.change,
                        icon: TrendingUp,
                        color: "success",
                        trend: statsData.uptime.trend,
                    },
                ];
                setStats(formattedStats);
            } else {
                console.error("Failed to fetch user stats");
                setStats(getDefaultStats());
            }
        } catch (error) {
            console.error("Error fetching user stats:", error);
            setStats(getDefaultStats());
        } finally {
            setStatsLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    };

    const getDefaultStats = () => [
        {
            title: "Total Projects",
            value: "0",
            change: "No projects yet",
            icon: FolderGit2,
            color: "primary",
            trend: "stable",
        },
        {
            title: "Active Deployments",
            value: "0",
            change: "No deployments yet",
            icon: Activity,
            color: "secondary",
            trend: "stable",
        },
        {
            title: "Total Visitors",
            value: "0",
            change: "No visitors yet",
            icon: Users,
            color: "accent",
            trend: "stable",
        },
        {
            title: "Uptime",
            value: "100%",
            change: "All time",
            icon: TrendingUp,
            color: "success",
            trend: "stable",
        },
    ];

    const fetchRecentProjects = async () => {
        try {
            const response = await axios.get(
                `${BASE_API_SERVER_URL}/projects/recent`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setRecentProjects(response.data.data || response.data);
            } else {
                console.error("Failed to fetch recent projects");
                setRecentProjects([]);
            }
        } catch (error) {
            console.error("Error fetching recent projects:", error);
            setRecentProjects([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg animate-glow">
                        <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Welcome back to SnapDeploy
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/create-project")}
                    className="btn-primary px-6 py-3 font-semibold group w-fit"
                >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    New Project
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsLoading
                    ? // Loading skeleton for stats
                      Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="card p-6 animate-pulse">
                              <div className="flex items-center justify-between mb-4">
                                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                              </div>
                              <div className="space-y-2">
                                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                              </div>
                          </div>
                      ))
                    : stats.map((stat, index) => (
                          <div
                              key={index}
                              className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          >
                              <div className="flex items-center justify-between mb-4">
                                  <div
                                      className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-xl`}
                                  >
                                      <stat.icon
                                          className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                                      />
                                  </div>
                              </div>
                              <div>
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      {stat.title}
                                  </p>
                                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                      {stat.value}
                                  </p>
                                  <p
                                      className={`text-sm ${
                                          stat.trend === "up"
                                              ? "text-green-600 dark:text-green-400"
                                              : stat.trend === "building"
                                              ? "text-yellow-600 dark:text-yellow-400"
                                              : "text-gray-500 dark:text-gray-400"
                                      }`}
                                  >
                                      {stat.change}
                                  </p>
                              </div>
                          </div>
                      ))}
            </div>

            {/* Recent Projects */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Recent Projects
                    </h2>
                    <button
                        onClick={() => navigate("/projects")}
                        className="text-primary-600 dark:text-primary-400 hover:text-secondary-600 dark:hover:text-secondary-400 font-medium text-sm flex items-center gap-1 transition-colors group"
                    >
                        View All
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : recentProjects.length > 0 ? (
                        recentProjects.map((project, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                        <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    project.status === "Active"
                                                        ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                                        : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                                                }`}
                                            >
                                                {project.status}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {project.deployed}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Globe className="h-4 w-4 text-primary-500" />
                                    <span className="font-mono">
                                        {project.url}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                No recent projects found. Create your first
                                project!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Deploy
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Deploy your GitHub repository in seconds with our
                        one-click deployment.
                    </p>
                    <button
                        onClick={() => navigate("/create-project")}
                        className="btn-primary w-full py-3 font-semibold"
                    >
                        Deploy Now
                    </button>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Need Help?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Check out our documentation and guides to get the most
                        out of SnapDeploy.
                    </p>
                    <button
                        onClick={() => navigate("/help-support")}
                        className="btn-secondary w-full py-3 font-semibold"
                    >
                        View Documentation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
