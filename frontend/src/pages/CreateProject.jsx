import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader, FolderGit2 } from "lucide-react";
import Cookies from "js-cookie";
import { BASE_API_SERVER_URL } from "../constant/url";

export function CreateProject() {
    const [formData, setFormData] = React.useState({
        name: "",
        gitURL: "",
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const token = Cookies.get("accessToken");

        try {
            const projectResponse = await axios.post(
                `${BASE_API_SERVER_URL}/projects`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const projectId = projectResponse.data.data._id;

            await axios.post(
                `${BASE_API_SERVER_URL}/deployments`,
                { projectId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            navigate(`/projects/${projectId}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <FolderGit2 className="mr-2 h-6 w-6" />
                Create New Project
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 rounded-lg p-6 shadow-lg">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Project Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="My Project"
                            />
                        </div>

                        <div>
                            <label htmlFor="gitURL" className="block text-sm font-medium text-gray-700 mb-1">
                                Git Repository URL
                            </label>
                            <input
                                type="url"
                                id="gitURL"
                                name="gitURL"
                                required
                                value={formData.gitURL}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://github.com/username/repository.git"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/projects')}
                            className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg flex items-center disabled:opacity-50 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CreateProject;