import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Loader,
    FolderGit2,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
} from "lucide-react";
import Cookies from "js-cookie";
import { BASE_API_SERVER_URL } from "../constant/url";

export function CreateProject() {
    const [formData, setFormData] = React.useState({
        name: "",
        gitURL: "",
        slug: "",
        frontendPath: "./",
        envVariables: {},
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [envVars, setEnvVars] = React.useState([{ key: "", value: "" }]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const token = Cookies.get("accessToken");

        // Convert env vars array to object
        const envVariables = {};
        envVars.forEach(({ key, value }) => {
            if (key.trim() && value.trim()) {
                envVariables[key.trim()] = value.trim();
            }
        });

        const projectData = {
            ...formData,
            envVariables,
        };

        try {
            const projectResponse = await axios.post(
                `${BASE_API_SERVER_URL}/projects`,
                projectData,
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

    const handleEnvVarChange = (index, field, value) => {
        const newEnvVars = [...envVars];
        newEnvVars[index][field] = value;
        setEnvVars(newEnvVars);
    };

    const addEnvVar = () => {
        setEnvVars([...envVars, { key: "", value: "" }]);
    };

    const removeEnvVar = (index) => {
        const newEnvVars = envVars.filter((_, i) => i !== index);
        setEnvVars(
            newEnvVars.length > 0 ? newEnvVars : [{ key: "", value: "" }]
        );
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
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
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
                            <label
                                htmlFor="gitURL"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
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
                        <div>
                            <label
                                htmlFor="slug"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                SubDomain (optional)
                            </label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="my-awesome-app"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to generate a random subdomain
                            </p>
                        </div>

                        {/* Advanced Options */}
                        <div className="border-t pt-4">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                {showAdvanced ? (
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                )}
                                Advanced Options
                            </button>

                            {showAdvanced && (
                                <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label
                                            htmlFor="frontendPath"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Frontend Path
                                        </label>
                                        <input
                                            type="text"
                                            id="frontendPath"
                                            name="frontendPath"
                                            value={formData.frontendPath}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="./ or frontend/ or client/"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Path to your frontend code within
                                            the repository (e.g., "./",
                                            "frontend/", "client/")
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Environment Variables
                                        </label>
                                        <div className="space-y-2">
                                            {envVars.map((envVar, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-2"
                                                >
                                                    <input
                                                        type="text"
                                                        placeholder="Variable name"
                                                        value={envVar.key}
                                                        onChange={(e) =>
                                                            handleEnvVarChange(
                                                                index,
                                                                "key",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Value"
                                                        value={envVar.value}
                                                        onChange={(e) =>
                                                            handleEnvVarChange(
                                                                index,
                                                                "value",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                    />
                                                    {envVars.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeEnvVar(
                                                                    index
                                                                )
                                                            }
                                                            className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addEnvVar}
                                                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Environment Variable
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            These will be available during the
                                            build process as environment
                                            variables
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 text-red-500 text-sm">{error}</div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/projects")}
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
                                "Create Project"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CreateProject;
