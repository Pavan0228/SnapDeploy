import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { BASE_API_SERVER_URL } from "../constant/url";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
    Github,
    GitBranch,
    Lock,
    Globe,
    Search,
    RefreshCw,
} from "lucide-react";

export const GitHubRepositorySelector = React.memo(
    ({ onRepositorySelect, selectedRepo }) => {
        const [repositories, setRepositories] = useState([]);
        const [branches, setBranches] = useState([]);
        const [loading, setLoading] = useState(false);
        const [loadingBranches, setLoadingBranches] = useState(false);
        const [isConnected, setIsConnected] = useState(false);
        const [githubUsername, setGithubUsername] = useState("");
        const [searchTerm, setSearchTerm] = useState("");
        const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
        const [page, setPage] = useState(1);
        const [hasMore, setHasMore] = useState(false);
        const [selectedBranch, setSelectedBranch] = useState("main");
        const [showRepositoryList, setShowRepositoryList] = useState(true);

        const token = Cookies.get("accessToken");

        // Debounce search term
        useEffect(() => {
            const timer = setTimeout(() => {
                setDebouncedSearchTerm(searchTerm);
            }, 300);

            return () => clearTimeout(timer);
        }, [searchTerm]);

        useEffect(() => {
            checkGitHubConnection();
        }, []);

        useEffect(() => {
            if (isConnected) {
                fetchRepositories();
            }
        }, [isConnected, page]);

        useEffect(() => {
            if (selectedRepo) {
                fetchBranches(selectedRepo.fullName);
                setShowRepositoryList(false); // Hide the list when a repo is pre-selected
            } else {
                setShowRepositoryList(true); // Show the list when no repo is selected
            }
        }, [selectedRepo]);

        const checkGitHubConnection = useCallback(async () => {
            try {
                const response = await axios.get(
                    `${BASE_API_SERVER_URL}/github/status`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setIsConnected(response.data.data.isConnected);
                setGithubUsername(response.data.data.username);
            } catch (error) {
                console.error("Error checking GitHub connection:", error);
            }
        }, [token]);

        const connectToGitHub = useCallback(async () => {
            try {
                const response = await axios.get(
                    `${BASE_API_SERVER_URL}/github/auth-url`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                // Open GitHub OAuth in a new window
                const authWindow = window.open(
                    response.data.authURL,
                    "github-auth",
                    "width=600,height=700,scrollbars=yes,resizable=yes"
                );

                // Listen for the OAuth callback
                const handleMessage = (event) => {
                    if (event.origin !== window.location.origin) return;

                    if (event.data.type === "GITHUB_AUTH_SUCCESS") {
                        authWindow.close();
                        handleAuthCallback(event.data.code);
                        window.removeEventListener("message", handleMessage);
                    }
                };

                window.addEventListener("message", handleMessage);
            } catch (error) {
                toast.error("Failed to initiate GitHub connection");
                console.error("Error connecting to GitHub:", error);
            }
        }, [token]);

        const handleAuthCallback = useCallback(
            async (code) => {
                try {
                    await axios.post(
                        `${BASE_API_SERVER_URL}/github/callback`,
                        { code },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    toast.success("GitHub connected successfully!");
                    checkGitHubConnection();
                } catch (error) {
                    toast.error("Failed to connect GitHub account");
                    console.error("Error in GitHub callback:", error);
                }
            },
            [token, checkGitHubConnection]
        );

        const fetchRepositories = useCallback(
            async (pageNum = page) => {
                setLoading(true);
                try {
                    const response = await axios.get(
                        `${BASE_API_SERVER_URL}/github/repositories`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { page: pageNum, per_page: 30 },
                        }
                    );

                    if (pageNum === 1) {
                        setRepositories(response.data.data);
                    } else {
                        // Filter out duplicates when adding new repositories
                        setRepositories((prev) => {
                            const existingIds = new Set(
                                prev.map((repo) => repo.id)
                            );
                            const newRepos = response.data.data.filter(
                                (repo) => !existingIds.has(repo.id)
                            );
                            return [...prev, ...newRepos];
                        });
                    }

                    setHasMore(response.data.pagination.hasMore);
                } catch (error) {
                    toast.error("Failed to fetch repositories");
                    console.error("Error fetching repositories:", error);
                }
                setLoading(false);
            },
            [page, token]
        );

        const fetchBranches = async (fullName) => {
            setLoadingBranches(true);
            try {
                const [owner, repo] = fullName.split("/");
                const response = await axios.get(
                    `${BASE_API_SERVER_URL}/github/repositories/${owner}/${repo}/branches`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setBranches(response.data.data);
                // Set default branch if current selection is not available
                const branchNames = response.data.data.map((b) => b.name);
                if (!branchNames.includes(selectedBranch)) {
                    const defaultBranch = branchNames.includes("main")
                        ? "main"
                        : branchNames.includes("master")
                        ? "master"
                        : branchNames[0];
                    setSelectedBranch(defaultBranch);
                }
            } catch (error) {
                toast.error("Failed to fetch branches");
                console.error("Error fetching branches:", error);
                setBranches([]);
            }
            setLoadingBranches(false);
        };

        const filteredRepositories = useMemo(() => {
            return repositories.filter(
                (repo) =>
                    repo.name
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase()) ||
                    repo.fullName
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase())
            );
        }, [repositories, debouncedSearchTerm]);

        const handleRepositorySelect = useCallback(
            (repo) => {
                onRepositorySelect({
                    ...repo,
                    selectedBranch: selectedBranch,
                });
                setShowRepositoryList(false); // Close the dropdown when a repo is selected
            },
            [onRepositorySelect, selectedBranch]
        );

        if (!isConnected) {
            return (
                <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-center">
                        <Github className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Connect to GitHub
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Connect your GitHub account to access your
                            repositories and deploy projects directly.
                        </p>
                        <button
                            onClick={connectToGitHub}
                            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2 mx-auto"
                        >
                            <Github className="w-4 h-4" />
                            Connect GitHub
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        <span className="font-medium">GitHub Repositories</span>
                        <span className="text-sm text-gray-500">
                            ({githubUsername})
                        </span>
                    </div>
                    <button
                        onClick={() => fetchRepositories(1)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </button>
                </div>

                {/* Selected Repository Summary */}
                {selectedRepo && !showRepositoryList && (
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-blue-900">
                                        {selectedRepo.name}
                                    </span>
                                    {selectedRepo.private ? (
                                        <Lock className="w-4 h-4 text-orange-500" />
                                    ) : (
                                        <Globe className="w-4 h-4 text-green-500" />
                                    )}
                                </div>
                                <p className="text-sm text-blue-700 mb-1">
                                    {selectedRepo.fullName}
                                </p>
                                {selectedRepo.description && (
                                    <p className="text-xs text-blue-600 mb-2">
                                        {selectedRepo.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-blue-600">
                                    {selectedRepo.language && (
                                        <span>{selectedRepo.language}</span>
                                    )}
                                    <span>
                                        Updated:{" "}
                                        {new Date(
                                            selectedRepo.updatedAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRepositoryList(true)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                )}

                {/* Repository Selection */}
                {showRepositoryList && (
                    <>
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Repository List */}
                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                            {loading && repositories.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    Loading repositories...
                                </div>
                            ) : filteredRepositories.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No repositories found
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredRepositories.map((repo, index) => (
                                        <div
                                            key={`${repo.id}-${repo.fullName}-${index}`}
                                            onClick={() =>
                                                handleRepositorySelect(repo)
                                            }
                                            className={`p-3 cursor-pointer hover:bg-gray-50 ${
                                                selectedRepo?.id === repo.id
                                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {repo.name}
                                                        </span>
                                                        {repo.private ? (
                                                            <Lock className="w-4 h-4 text-orange-500" />
                                                        ) : (
                                                            <Globe className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {repo.fullName}
                                                    </p>
                                                    {repo.description && (
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            {repo.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500">
                                                        {repo.language}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(
                                                            repo.updatedAt
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Load More */}
                        {hasMore && (
                            <button
                                onClick={() => {
                                    setPage((prev) => prev + 1);
                                    fetchRepositories(page + 1);
                                }}
                                disabled={loading}
                                className="w-full py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Loading..." : "Load More"}
                            </button>
                        )}
                    </>
                )}

                {/* Branch Selection - Only show after repo is selected */}
                {selectedRepo && branches.length > 0 && (
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <GitBranch className="w-4 h-4" />
                            <label className="font-medium">
                                Select Branch:
                            </label>
                        </div>
                        <select
                            value={selectedBranch}
                            onChange={(e) => {
                                setSelectedBranch(e.target.value);
                                handleRepositorySelect({
                                    ...selectedRepo,
                                    selectedBranch: e.target.value,
                                });
                            }}
                            disabled={loadingBranches}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {branches.map((branch) => (
                                <option key={branch.name} value={branch.name}>
                                    {branch.name}{" "}
                                    {branch.name === selectedRepo.defaultBranch
                                        ? "(default)"
                                        : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        );
    }
);
