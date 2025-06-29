import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Github,
    Globe,
    Clock,
    AlertCircle,
    Loader,
    ExternalLink,
    FolderGit2,
    Plus,
    Zap,
    Activity,
    ArrowRight,
} from "lucide-react";
import { BASE_API_SERVER_URL } from "../constant/url";
import Cookies from "js-cookie";
import { useTheme } from "../contexts/ThemeContext";

export function ProjectList() {
    const { theme } = useTheme();
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchProjects = async () => {
            const token = Cookies.get("accessToken");

            try {
                setLoading(true);
                const response = await axios.get(
                    `${BASE_API_SERVER_URL}/projects`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setProjects(
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : [response.data.data]
                );
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Loading your projects...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Failed to load projects
                    </h3>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="container mx-auto p-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg">
                            <FolderGit2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                My Projects
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage and deploy your applications
                            </p>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="card p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="relative mb-8">
                            <div className="p-6 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-lg mx-auto w-fit animate-glow">
                                <FolderGit2 className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Ready to Deploy?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Start your journey with SnapDeploy. Create your
                            first project and watch your ideas come to life in
                            seconds.
                        </p>
                        <button
                            onClick={() => navigate("/create-project")}
                            className="btn-primary group"
                        >
                            <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                            Create Your First Project
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg">
                        <FolderGit2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            My Projects
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {projects.length} project
                            {projects.length !== 1 ? "s" : ""} ready to deploy
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

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div
                        key={project._id}
                        className="card p-6 cursor-pointer hover:shadow-2xl hover:shadow-primary-500/20 dark:hover:shadow-primary-500/10 transition-all duration-300 transform hover:-translate-y-1 group"
                        onClick={() => navigate(`/projects/${project._id}`)}
                    >
                        {/* Project Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                    <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {project.name}
                                    </h2>
                                </div>
                            </div>
                            <span className="text-xs bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-1 rounded-full font-medium">
                                {project.deployments?.length || 0} deploys
                            </span>
                        </div>

                        {/* Project Details */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                                <Globe className="h-4 w-4 mr-3 text-primary-500" />
                                <span className="text-sm truncate font-mono">
                                    {project.subdomain || "Generating..."}
                                </span>
                            </div>

                            <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                                <Github className="h-4 w-4 mr-3 text-primary-500" />
                                <span className="text-sm truncate">
                                    {project.gitURL?.replace(
                                        "https://github.com/",
                                        ""
                                    ) || "No repository"}
                                </span>
                            </div>

                            <div className="flex items-center text-gray-500 dark:text-gray-500 text-sm">
                                <Clock className="h-4 w-4 mr-3" />
                                Created{" "}
                                {new Date(
                                    project.createdAt
                                ).toLocaleDateString()}
                            </div>
                        </div>

                        {/* View Details Button */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        Active
                                    </span>
                                </div>
                                <div className="text-primary-600 dark:text-primary-400 hover:text-secondary-600 dark:hover:text-secondary-400 text-sm flex items-center font-medium transition-colors group-hover:translate-x-1 duration-300">
                                    View Details
                                    <ExternalLink className="h-4 w-4 ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProjectList;
