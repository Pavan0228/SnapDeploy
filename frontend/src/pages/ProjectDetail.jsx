import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
    Github,
    Globe,
    AlertCircle,
    Loader,
    CheckCircle,
    XCircle,
    ExternalLink,
    RefreshCw,
} from "lucide-react";
import { BASE_API_SERVER_URL, REVERSE_PROXY_URL } from "../constant/url";
import Cookies from "js-cookie";

export function ProjectDetail() {
    const { projectId } = useParams();
    const [project, setProject] = React.useState(null);
    const [logs, setLogs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [isStreaming, setIsStreaming] = React.useState(false);
    const [previewLoaded, setPreviewLoaded] = React.useState(false);
    const [deploymentPhase, setDeploymentPhase] = React.useState(null);

    // Define refs before using them
    const eventSourceRef = React.useRef(null);
    const isMounted = React.useRef(true); // Define stopStreaming before using it in other functions
    const stopStreaming = React.useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (isMounted.current) {
            setIsStreaming(false);
        }
    }, []);
    const startStreaming = React.useCallback(
        (deploymentId) => {
            if (!deploymentId || !isMounted.current) return;

            // Stop any existing stream
            stopStreaming();

            const token = Cookies.get("accessToken");
            if (!token) {
                setError("No access token found");
                return;
            }

            try {
                setIsStreaming(true);

                // Create EventSource for Server-Sent Events
                const eventSource = new EventSource(
                    `${BASE_API_SERVER_URL}/logs/${deploymentId}/stream?token=${encodeURIComponent(
                        token
                    )}`
                );

                eventSourceRef.current = eventSource;
                eventSource.onmessage = (event) => {
                    if (!isMounted.current) return;

                    try {
                        const data = JSON.parse(event.data);

                        if (data.error) {
                            console.error("Stream error:", data.error);
                            setError(data.error);
                            stopStreaming();
                            return;
                        }

                        if (data.status === "terminal") {
                            console.log(
                                `Deployment ${data.finalStatus}, stopping stream`
                            );
                            stopStreaming();
                            return;
                        }
                        if (data.logs) {
                            setLogs(data.logs);
                            setError(null); // Clear any previous errors

                            // Update deployment phase
                            const phase = getDeploymentPhase(data.logs);
                            setDeploymentPhase(phase);
                        }
                    } catch (parseError) {
                        console.error("Error parsing SSE data:", parseError);
                    }
                };

                eventSource.onerror = (error) => {
                    console.error("EventSource error:", error);
                    if (
                        isMounted.current &&
                        eventSource.readyState === EventSource.CLOSED
                    ) {
                        stopStreaming();
                        // Don't automatically reconnect on error to avoid infinite loops
                        setError(
                            "Connection lost. Please refresh the page to reconnect."
                        );
                    }
                };

                eventSource.onopen = () => {
                    console.log("SSE connection established");
                    setError(null); // Clear any previous errors
                };
            } catch (error) {
                console.error("Error starting stream:", error);
                setError(error.message);
                stopStreaming();
            }
        },
        [stopStreaming]
    );
    React.useEffect(() => {
        const fetchProject = async () => {
            const token = Cookies.get("accessToken");
            if (!token) {
                setError("No access token found");
                return;
            }

            try {
                setLoading(true);
                const projectRes = await axios.get(
                    `${BASE_API_SERVER_URL}/projects/${projectId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!isMounted.current) return;

                setProject(projectRes.data.data);

                const deployments = projectRes.data.data.deployments || [];
                const latestDeploymentId = deployments[deployments.length - 1];

                if (latestDeploymentId) {
                    startStreaming(latestDeploymentId);
                }

                setError(null);
            } catch (err) {
                if (isMounted.current) {
                    setError(err.message);
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        isMounted.current = true;
        fetchProject();

        return () => {
            isMounted.current = false;
            stopStreaming();
        };
    }, [projectId, startStreaming, stopStreaming]);

    const previewUrl = project?.subdomain
        ? `http://${project.subdomain}.${REVERSE_PROXY_URL}`
        : "";

    const refreshLogs = React.useCallback(async () => {
        if (!project?.deployments?.length) return;

        const token = Cookies.get("accessToken");
        if (!token) {
            setError("No access token found");
            return;
        }
        try {
            const latestDeploymentId =
                project.deployments[project.deployments.length - 1];
            const logsRes = await axios.get(
                `${BASE_API_SERVER_URL}/logs/${latestDeploymentId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const newLogs = logsRes.data.logs || [];
            setLogs(newLogs); // No need to reverse, backend sends in chronological order

            // Update deployment phase
            const phase = getDeploymentPhase(newLogs);
            setDeploymentPhase(phase);

            setError(null);
        } catch (err) {
            console.error("Error fetching logs:", err);
            setError(err.message);
        }
    }, [project]);

    // Helper function to determine deployment phase
    const getDeploymentPhase = React.useCallback((logs) => {
        if (!logs || logs.length === 0) return null;

        const latestLog = logs[logs.length - 1];
        const logText = latestLog.log.toLowerCase();

        if (latestLog.status === "completed") return "completed";
        if (latestLog.status === "failed") return "failed";

        // Determine phase based on log content
        if (logText.includes("deployment started")) return "initializing";
        if (
            logText.includes("installing dependencies") ||
            logText.includes("installing") ||
            logText.includes("npm install")
        )
            return "dependencies";
        if (
            logText.includes("building") ||
            logText.includes("compiling") ||
            logText.includes("bundling")
        )
            return "building";
        if (logText.includes("uploading") || logText.includes("upload"))
            return "uploading";

        return "running";
    }, []);

    // Auto-scroll to bottom when new logs arrive
    const logsContainerRef = React.useRef(null);

    React.useEffect(() => {
        if (logsContainerRef.current && isStreaming) {
            logsContainerRef.current.scrollTop =
                logsContainerRef.current.scrollHeight;
        }
    }, [logs, isStreaming]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
                <div className="flex flex-col items-center space-y-4 animate-pulse">
                    <Loader className="w-16 h-16 animate-spin text-indigo-600" />
                    <p className="text-xl font-medium text-gray-700">
                        Loading your project...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
                <div className="bg-white p-8 rounded-xl shadow-xl flex items-center space-x-6 max-w-lg mx-4">
                    <AlertCircle className="w-12 h-12 text-red-500 flex-shrink-0" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Error Loading Project
                        </h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Project Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 backdrop-blur-lg bg-opacity-95 transition-all hover:shadow-2xl">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {project.name}
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    {project.description ||
                                        "No description available"}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <a
                                    href={project.gitURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all transform hover:scale-105 shadow-md"
                                >
                                    <Github className="h-5 w-5 mr-2" />
                                    <span>View Repository</span>
                                </a>
                                {previewUrl && (
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-md"
                                    >
                                        <Globe className="h-5 w-5 mr-2" />
                                        <span>Open Preview</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {previewUrl && (
                            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-50 transition-opacity z-10"></div>
                                <iframe
                                    src={previewUrl}
                                    className={`w-full h-full border-0 transition-opacity duration-500 ${
                                        previewLoaded
                                            ? "opacity-100"
                                            : "opacity-0"
                                    }`}
                                    title="Website Preview"
                                    onLoad={() => setPreviewLoaded(true)}
                                    sandbox="allow-same-origin allow-scripts allow-forms"
                                />
                                {!previewLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                                    </div>
                                )}
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center shadow-lg hover:bg-gray-100"
                                >
                                    <span className="mr-2">Open preview</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Deployment Status */}
                {(isStreaming || logs.length > 0) && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 backdrop-blur-lg bg-opacity-95">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Deployment Status
                        </h2>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                {/* Phase Indicators */}
                                <div className="flex items-center space-x-4">
                                    <div
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                                            [
                                                "initializing",
                                                "dependencies",
                                                "building",
                                                "uploading",
                                                "completed",
                                            ].includes(deploymentPhase)
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {deploymentPhase === "initializing" ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : [
                                              "dependencies",
                                              "building",
                                              "uploading",
                                              "completed",
                                          ].includes(deploymentPhase) ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                        )}
                                        <span className="text-sm font-medium">
                                            Initialize
                                        </span>
                                    </div>

                                    <div
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                                            [
                                                "dependencies",
                                                "building",
                                                "uploading",
                                                "completed",
                                            ].includes(deploymentPhase)
                                                ? "bg-green-100 text-green-800"
                                                : deploymentPhase ===
                                                  "dependencies"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {deploymentPhase === "dependencies" ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : [
                                              "building",
                                              "uploading",
                                              "completed",
                                          ].includes(deploymentPhase) ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                        )}
                                        <span className="text-sm font-medium">
                                            Build
                                        </span>
                                    </div>

                                    <div
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                                            ["uploading", "completed"].includes(
                                                deploymentPhase
                                            )
                                                ? deploymentPhase ===
                                                  "uploading"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {deploymentPhase === "uploading" ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : deploymentPhase === "completed" ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : deploymentPhase === "failed" ? (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                        )}
                                        <span className="text-sm font-medium">
                                            Deploy
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Overall Status */}
                            <div
                                className={`px-6 py-3 rounded-xl font-semibold ${
                                    deploymentPhase === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : deploymentPhase === "failed"
                                        ? "bg-red-100 text-red-800"
                                        : isStreaming
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {deploymentPhase === "completed" &&
                                    "🎉 Deployed Successfully"}
                                {deploymentPhase === "failed" &&
                                    "❌ Deployment Failed"}
                                {deploymentPhase === "initializing" &&
                                    "🚀 Initializing..."}
                                {deploymentPhase === "dependencies" &&
                                    "📦 Installing Dependencies..."}
                                {deploymentPhase === "building" &&
                                    "🔨 Building Application..."}
                                {deploymentPhase === "uploading" &&
                                    "☁️ Uploading to Cloud..."}
                                {!deploymentPhase &&
                                    isStreaming &&
                                    "⏳ Starting Deployment..."}
                                {!deploymentPhase &&
                                    !isStreaming &&
                                    "📋 Deployment Logs"}
                            </div>
                        </div>
                    </div>
                )}

                {/* Deployment Logs */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 backdrop-blur-lg bg-opacity-95">
                    {" "}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Deployment Logs
                        </h2>
                        <div className="flex items-center gap-3">
                            {!isStreaming && (
                                <button
                                    onClick={refreshLogs}
                                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all transform hover:scale-105"
                                    title="Refresh logs"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">
                                        Refresh
                                    </span>
                                </button>
                            )}
                            {isStreaming && (
                                <div className="flex items-center px-4 py-2 bg-indigo-100 rounded-full animate-pulse">
                                    <Loader className="w-4 h-4 animate-spin text-indigo-600 mr-2" />
                                    <span className="text-sm font-medium text-indigo-700">
                                        Live updates...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        className="rounded-xl border border-gray-200 shadow-inner bg-gray-50 max-h-[600px] overflow-y-auto"
                        ref={logsContainerRef}
                    >
                        {" "}
                        {logs.length > 0 ? (
                            [...logs].reverse().map((log) => (
                                <div
                                    key={log.event_id}
                                    className="border-b border-gray-100 last:border-b-0 p-4 hover:bg-white transition-all hover:shadow-md"
                                >
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex justify-between items-start gap-4 flex-wrap">
                                            <div className="flex items-center space-x-3">
                                                {log.status === "completed" && (
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                )}
                                                {log.status === "failed" && (
                                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                )}
                                                {log.status === "running" && (
                                                    <Loader className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
                                                )}
                                                <span className="font-medium text-gray-800">
                                                    {log.log}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                                                        log.status ===
                                                        "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : log.status ===
                                                              "failed"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-indigo-100 text-indigo-800"
                                                    }`}
                                                >
                                                    {log.status}
                                                </span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                                    {new Date(
                                                        log.timestamp
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                                    <AlertCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">
                                    No deployment logs available yet
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetail;
