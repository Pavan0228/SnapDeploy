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
    Activity,
    Zap,
    Clock,
    Eye,
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
        ? `https://${project.subdomain}.${REVERSE_PROXY_URL}`
        : "";

    // Check if deployment is successfully completed
    const isDeploymentCompleted = deploymentPhase === "completed";

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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="p-6 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-lg mx-auto w-fit mb-6 animate-glow">
                        <Zap className="h-12 w-12 text-white animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Loading Project
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Fetching your project details...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Failed to Load Project
                    </h3>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="container mx-auto p-4 space-y-8">
            {/* Project Header */}
            <div className="card p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold gradient-text">
                                    {project.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {project.description ||
                                        "SnapDeploy Project"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a
                                href={project.gitURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary p-4 group"
                            >
                                <Github className="h-5 w-5 mr-3" />
                                <span>View Repository</span>
                                <ExternalLink className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                            </a>
                            {previewUrl && isDeploymentCompleted && (
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary p-4 group"
                                >
                                    <Globe className="h-5 w-5 mr-3" />
                                    <span>Open Live Site</span>
                                    <ExternalLink className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}
                        </div>

                        {/* Project Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {project.deployments?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Deployments
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    99.9%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Uptime
                                </div>
                            </div>
                        </div>
                    </div>

                    {previewUrl && isDeploymentCompleted && (
                        <div className="relative group">
                            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
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
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        <div className="text-center">
                                            <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Loading preview...
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            Open in new tab
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Deployment Status Indicator */}
                    {previewUrl && !isDeploymentCompleted && (
                        <div className="relative group">
                            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="p-6 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-lg mb-6 animate-pulse">
                                            <Zap className="h-12 w-12 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {deploymentPhase === "failed"
                                                ? "Deployment Failed"
                                                : isStreaming
                                                ? "Deployment in Progress..."
                                                : "Preparing Deployment..."}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {deploymentPhase === "failed"
                                                ? "Please check the logs below for error details"
                                                : "Your website preview will appear here once deployment is complete"}
                                        </p>
                                        {isStreaming && (
                                            <div className="mt-4 flex items-center justify-center gap-2">
                                                <Loader className="w-4 h-4 animate-spin text-primary-600" />
                                                <span className="text-sm text-primary-600 dark:text-primary-400">
                                                    {deploymentPhase ===
                                                        "initializing" &&
                                                        "Initializing..."}
                                                    {deploymentPhase ===
                                                        "dependencies" &&
                                                        "Installing Dependencies..."}
                                                    {deploymentPhase ===
                                                        "building" &&
                                                        "Building Application..."}
                                                    {deploymentPhase ===
                                                        "uploading" &&
                                                        "Uploading to Cloud..."}
                                                    {!deploymentPhase &&
                                                        "Starting..."}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Deployment Status */}
            {(isStreaming || logs.length > 0) && (
                <div className="card">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Deployment Status
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Real-time deployment pipeline status
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Phase Indicators */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div
                                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                                    [
                                        "dependencies",
                                        "building",
                                        "uploading",
                                        "completed",
                                    ].includes(deploymentPhase)
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                        : deploymentPhase === "initializing"
                                        ? "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
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
                                    <div className="w-4 h-4 rounded-full border-2 border-current opacity-30"></div>
                                )}
                                <span className="text-sm font-medium">
                                    Initialize
                                </span>
                            </div>

                            <div
                                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                                    [
                                        "building",
                                        "uploading",
                                        "completed",
                                    ].includes(deploymentPhase)
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                        : deploymentPhase === "dependencies"
                                        ? "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
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
                                    <div className="w-4 h-4 rounded-full border-2 border-current opacity-30"></div>
                                )}
                                <span className="text-sm font-medium">
                                    Build
                                </span>
                            </div>

                            <div
                                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                                    deploymentPhase === "completed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                        : deploymentPhase === "uploading"
                                        ? "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                                        : deploymentPhase === "failed"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                                {deploymentPhase === "uploading" ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : deploymentPhase === "completed" ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : deploymentPhase === "failed" ? (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-current opacity-30"></div>
                                )}
                                <span className="text-sm font-medium">
                                    Deploy
                                </span>
                            </div>
                        </div>

                        {/* Overall Status */}
                        <div
                            className={`px-6 py-3 rounded-xl font-semibold border ${
                                deploymentPhase === "completed"
                                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                    : deploymentPhase === "failed"
                                    ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                    : isStreaming
                                    ? "bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800"
                                    : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
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
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-secondary-600 to-primary-600 rounded-xl shadow-lg">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Deployment Logs
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {isStreaming
                                    ? "Real-time log streaming"
                                    : "Deployment history"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isStreaming && (
                            <button
                                onClick={refreshLogs}
                                className="btn-secondary group"
                                title="Refresh logs"
                            >
                                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                                <span className="text-sm font-medium">
                                    Refresh
                                </span>
                            </button>
                        )}
                        {isStreaming && (
                            <div className="flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/20 rounded-full animate-pulse">
                                <Loader className="w-4 h-4 animate-spin text-primary-600 dark:text-primary-400 mr-2" />
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                    Live updates
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                    ref={logsContainerRef}
                >
                    {logs.length > 0 ? (
                        [...logs].reverse().map((log) => (
                            <div
                                key={log.event_id}
                                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 p-4 hover:bg-white dark:hover:bg-gray-800 transition-all"
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
                                                <Loader className="w-5 h-5 text-primary-500 animate-spin flex-shrink-0" />
                                            )}
                                            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono text-sm">
                                                {log.log}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`text-xs px-3 py-1 rounded-full font-medium ${
                                                    log.status === "completed"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                        : log.status ===
                                                          "failed"
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                                        : "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                                                }`}
                                            >
                                                {log.status}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-3 py-1 rounded-full">
                                                <Clock className="w-3 h-3 inline mr-1" />
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
                        <div className="p-12 text-center">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No Logs Available
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Deployment logs will appear here once your
                                project starts building
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProjectDetail;
