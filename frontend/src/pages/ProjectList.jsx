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
} from "lucide-react";
import { BASE_API_SERVER_URL } from "../constant/url";
import Cookies from "js-cookie";

export function ProjectList() {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchProjects = async () => {
            const token = Cookies.get("accessToken");
            
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_API_SERVER_URL}/projects`,{
                    headers: { Authorization: `Bearer ${token}` },
                });
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
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                <AlertCircle className="w-6 h-6 mr-2" />
                <span>{error}</span>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6 flex items-center">
                    <FolderGit2 className="mr-2 h-6 w-6" />
                    My Projects
                </h1>
                <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 rounded-lg shadow-lg">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h2>
                        <p className="text-gray-600">Start by creating your first project</p>
                    </div>
                    <button 
                        onClick={() => navigate('/create-project')}
                        className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Project
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <FolderGit2 className="mr-2 h-6 w-6" />
                My Projects
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                    <div
                        key={project._id}
                        className="bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                        onClick={() => navigate(`/projects/${project._id}`)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {project.name}
                            </h2>
                            <span className="text-xs bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full">
                                {project.deployments?.length || 0} deploys
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                                <Globe className="h-4 w-4 mr-2" />
                                <span className="text-sm truncate">
                                    {project.subdomain}
                                </span>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <Github className="h-4 w-4 mr-2" />
                                <span className="text-sm truncate">
                                    {project.gitURL}
                                </span>
                            </div>

                            <div className="flex items-center text-gray-500 text-sm mt-4">
                                <Clock className="h-4 w-4 mr-1" />
                                Created{" "}
                                {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="mt-4 text-indigo-600 hover:text-purple-600 text-sm flex items-center justify-end transition-colors">
                            View Details{" "}
                            <ExternalLink className="h-4 w-4 ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProjectList;