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
    Zap,
    Github,
    Globe,
    Link,
    Code,
} from "lucide-react";
import Cookies from "js-cookie";
import { BASE_API_SERVER_URL } from "../constant/url";
import { useTheme } from "../contexts/ThemeContext";
import { GitHubRepositorySelector } from "../components/GitHubRepositorySelector";

export function CreateProject() {
    const { theme } = useTheme();
    const [formData, setFormData] = React.useState({
        name: "",
        gitURL: "",
        slug: "",
        frontendPath: "./",
        envVariables: {},
        githubRepoId: "",
        githubBranch: "main",
        isPrivateRepo: false,
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [envVars, setEnvVars] = React.useState([{ key: "", value: "" }]);
    const [useGitHubSelector, setUseGitHubSelector] = React.useState(false);
    const [selectedRepo, setSelectedRepo] = React.useState(null);
    const navigate = useNavigate();

    // Generate a slug from a name by replacing spaces with dashes and converting to lowercase
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/\s+/g, "-") // Replace spaces with dashes
            .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric characters except dashes
            .replace(/--+/g, "-") // Replace multiple consecutive dashes with single dash
            .replace(/^-|-$/g, ""); // Remove leading and trailing dashes
    };

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
        const { name, value } = e.target;

        // Auto-generate slug when project name changes
        if (name === "name" && value.trim()) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                slug: generateSlug(value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleRepositorySelect = (repo) => {
        setSelectedRepo(repo);
        const repoName = repo.name;
        const generatedSlug = generateSlug(repoName);

        setFormData((prev) => ({
            ...prev,
            name: repoName,
            gitURL: repo.htmlUrl,
            slug: generatedSlug,
            githubRepoId: repo.id.toString(),
            githubBranch: repo.selectedBranch || repo.defaultBranch || "main",
            isPrivateRepo: repo.private,
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
        <div className="container mx-auto p-4 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Create New Project
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Deploy your application in seconds with SnapDeploy
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Configuration */}
                <div className="card p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <FolderGit2 className="h-6 w-6 text-primary-600" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Project Configuration
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                                className="input-field"
                                placeholder="My Awesome Project"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Github className="h-4 w-4 inline mr-1" />
                                    Repository Source
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUseGitHubSelector(false)
                                        }
                                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                            !useGitHubSelector
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    >
                                        <Link className="w-4 h-4 inline mr-1" />
                                        URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUseGitHubSelector(true)
                                        }
                                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                            useGitHubSelector
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    >
                                        <Code className="w-4 h-4 inline mr-1" />
                                        GitHub
                                    </button>
                                </div>
                            </div>

                            {useGitHubSelector ? (
                                <GitHubRepositorySelector
                                    onRepositorySelect={handleRepositorySelect}
                                    selectedRepo={selectedRepo}
                                />
                            ) : (
                                <div>
                                    <input
                                        type="url"
                                        id="gitURL"
                                        name="gitURL"
                                        required
                                        value={formData.gitURL}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="https://github.com/username/repository.git"
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Enter a public GitHub repository URL or
                                        connect your GitHub account to access
                                        private repositories.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="slug"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                <Globe className="h-4 w-4 inline mr-1" />
                                Subdomain
                            </label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="my-awesome-app"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Auto-generated from project name. Your app will
                                be available at{" "}
                                <span className="font-mono text-primary-600 dark:text-primary-400">
                                    {formData.slug || "your-domain"}
                                    .snapdeploy.app
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Advanced Options */}
                <div className="card p-8">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full mb-6 text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                {showAdvanced ? (
                                    <ChevronUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                )}
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                Advanced Configuration
                            </h2>
                        </div>
                    </button>

                    {showAdvanced && (
                        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                            <div>
                                <label
                                    htmlFor="frontendPath"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Frontend Path
                                </label>
                                <input
                                    type="text"
                                    id="frontendPath"
                                    name="frontendPath"
                                    value={formData.frontendPath}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="./ or frontend/ or client/"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Path to your frontend code within the
                                    repository
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Environment Variables
                                </label>
                                <div className="space-y-3">
                                    {envVars.map((envVar, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
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
                                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
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
                                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                                            />
                                            {envVars.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeEnvVar(index)
                                                    }
                                                    className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addEnvVar}
                                        className="flex items-center gap-2 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-300 font-medium"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Environment Variable
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                    These will be available during the build
                                    process as environment variables
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate("/projects")}
                        className="btn-secondary px-6 py-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-8 py-3 text-base font-semibold group"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin h-5 w-5 mr-2" />
                                Creating Project...
                            </>
                        ) : (
                            <>
                                <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                                Deploy Project
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateProject;
