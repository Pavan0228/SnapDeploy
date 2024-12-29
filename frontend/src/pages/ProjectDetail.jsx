import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Github, Globe, AlertCircle, Loader, CheckCircle, XCircle } from "lucide-react";
import { BASE_API_SERVER_URL } from "../constant/url";
import Cookies from "js-cookie";

export function ProjectDetail() {
    const { projectId } = useParams();
    const [project, setProject] = React.useState(null);
    const [logs, setLogs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [isPolling, setIsPolling] = React.useState(false);
    const pollingInterval = React.useRef(null);

    const stopPolling = React.useCallback(() => {
        setIsPolling(false);
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    }, []);

    const fetchLogs = React.useCallback(async (deploymentId) => {
        const token = Cookies.get("accessToken");
        try {
            const logsRes = await axios.get(
                `${BASE_API_SERVER_URL}/logs/${deploymentId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const newLogs = logsRes.data.logs || [];
            const reversedLogs = [...newLogs].reverse();
            
            // Check for completion conditions before setting logs
            const lastLog = reversedLogs[0]; // Check the most recent log
            const shouldStopPolling = 
                reversedLogs.length >= 25 || 
                (lastLog && (lastLog.status === "completed" || lastLog.status === "failed"));

            if (shouldStopPolling) {
                stopPolling();
            }

            setLogs(reversedLogs);
        } catch (err) {
            console.error("Error fetching logs:", err);
            stopPolling();
        }
    }, [stopPolling]);

    React.useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get("accessToken");
            try {
                setLoading(true);
                const projectRes = await axios.get(
                    `${BASE_API_SERVER_URL}/projects/${projectId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setProject(projectRes.data.data);

                const latestDeploymentId = projectRes.data.data.deployments[
                    projectRes.data.data.deployments.length - 1
                ];

                if (latestDeploymentId) {
                    // Initial fetch
                    await fetchLogs(latestDeploymentId);
                    
                    // Start polling only if not completed/failed and less than 25 logs
                    setIsPolling(true);
                    pollingInterval.current = setInterval(() => {
                        fetchLogs(latestDeploymentId);
                    }, 3000);
                }

                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Cleanup function
        return () => {
            stopPolling();
        };
    }, [projectId, fetchLogs, stopPolling]);

    // Rest of the component remains the same...
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
                <div className="flex flex-col items-center space-y-4">
                    <Loader className="w-12 h-12 animate-spin text-indigo-600" />
                    <p className="text-lg font-medium text-gray-700">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <div>
                        <h3 className="font-bold text-gray-900">Error</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const previewUrl = project.subdomain ? `${project.subdomain}.yourdomain.com` : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Project Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 backdrop-blur-sm bg-opacity-90">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {project.name}
                            </h1>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href={project.gitURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <Github className="h-5 w-5 text-gray-700 group-hover:text-indigo-600 mr-2" />
                                    <span className="text-gray-700 group-hover:text-indigo-600">Repository</span>
                                </a>
                                {previewUrl && (
                                    <a
                                        href={`https://${previewUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                    >
                                        <Globe className="h-5 w-5 text-gray-700 group-hover:text-indigo-600 mr-2" />
                                        <span className="text-gray-700 group-hover:text-indigo-600">{previewUrl}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                        {previewUrl && (
                            <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                                <iframe
                                    src={`https://${previewUrl}`}
                                    className="w-full h-full border-0"
                                    title="Website Preview"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Deployment Logs */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 backdrop-blur-sm bg-opacity-90">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Deployment Logs
                        </h2>
                        {isPolling && (
                            <div className="flex items-center px-4 py-2 bg-indigo-50 rounded-full">
                                <Loader className="w-4 h-4 animate-spin text-indigo-600 mr-2" />
                                <span className="text-sm text-indigo-700">Live updating...</span>
                            </div>
                        )}
                    </div>
                    <div className="rounded-xl border border-gray-100 shadow-inner bg-gray-50 max-h-[600px] overflow-y-auto">
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <div
                                    key={log.event_id}
                                    className="border-b border-gray-100 last:border-b-0 p-4 hover:bg-white transition-colors"
                                >
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex items-center space-x-3">
                                                {log.status === "completed" && (
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                )}
                                                {log.status === "failed" && (
                                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                )}
                                                <span className="font-medium text-gray-800">
                                                    {log.log}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                                                        log.status === "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : log.status === "failed"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-indigo-100 text-indigo-800"
                                                    }`}
                                                >
                                                    {log.status}
                                                </span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                                    {log.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                                    <AlertCircle className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No deployment logs available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetail;