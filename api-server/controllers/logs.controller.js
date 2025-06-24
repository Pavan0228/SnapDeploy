import {
    getLogsFromClickhouse,
    getLatestLogStatus,
} from "../services/clickhouse.service.js";

export const getLogs = async (req, res) => {
    const id = req.params.id;
    try {
        const logs = await getLogsFromClickhouse(id);
        return res.json({ logs });
    } catch (error) {
        console.error("Error fetching logs:", error);

        // Check if it's a connection timeout error
        if (error.code === "ETIMEDOUT" || error.message.includes("ETIMEDOUT")) {
            return res.status(503).json({
                error: "Database connection timeout",
                message:
                    "The database is currently experiencing connectivity issues. Please try again in a few moments.",
                retryAfter: 30,
            });
        }

        return res.status(500).json({
            error: "Failed to fetch logs",
            message: error.message,
        });
    }
};

export const streamLogs = async (req, res) => {
    const deploymentId = req.params.id;

    // Set headers for Server-Sent Events
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
    });
    let intervalId;
    let heartbeatId;
    let lastLogCount = 0;
    let isTerminalState = false;
    const checkTerminalState = (logs) => {
        if (logs.length === 0) return false;
        // Check the latest log (last in chronological order)
        const latestLog = logs[logs.length - 1];
        const terminalStates = ["completed", "failed"];
        return terminalStates.includes(latestLog.status);
    };

    // Send heartbeat to keep connection alive
    const sendHeartbeat = () => {
        res.write(`: heartbeat ${Date.now()}\n\n`);
    };
    const sendLogs = async () => {
        try {
            const logs = await getLogsFromClickhouse(deploymentId);

            // Logs are already ordered by timestamp ASC from the query
            // Only send data if logs have changed or if it's the first time
            if (logs.length !== lastLogCount || lastLogCount === 0) {
                lastLogCount = logs.length;

                const data = JSON.stringify({
                    logs: logs, // Send in chronological order
                    timestamp: new Date().toISOString(),
                    deploymentId,
                    latestStatus:
                        logs.length > 0 ? logs[logs.length - 1].status : null,
                });

                res.write(`data: ${data}\n\n`);
            }

            // Check if we've reached a terminal state
            if (checkTerminalState(logs)) {
                isTerminalState = true;
                const latestStatus = logs[logs.length - 1].status;
                res.write(
                    `data: ${JSON.stringify({
                        status: "terminal",
                        finalStatus: latestStatus,
                        deploymentId,
                    })}\n\n`
                );
                cleanup();
            }
        } catch (error) {
            console.error("Error fetching logs in stream:", error);

            // Check if it's a connection timeout error
            if (
                error.code === "ETIMEDOUT" ||
                error.message.includes("ETIMEDOUT")
            ) {
                res.write(
                    `data: ${JSON.stringify({
                        error: "Database connection timeout - retrying...",
                        type: "connection_timeout",
                        deploymentId,
                        retryable: true,
                    })}\n\n`
                );
                // Don't cleanup on timeout, let it retry
                return;
            }

            // For other errors, send error and cleanup
            res.write(
                `data: ${JSON.stringify({
                    error: error.message,
                    type: "database_error",
                    deploymentId,
                    retryable: false,
                })}\n\n`
            );
            cleanup();
        }
    };

    const cleanup = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        if (heartbeatId) {
            clearInterval(heartbeatId);
            heartbeatId = null;
        }
        if (!res.writableEnded) {
            res.end();
        }
    }; // Send initial logs immediately
    await sendLogs();

    // Start polling if not in terminal state
    if (!isTerminalState) {
        intervalId = setInterval(sendLogs, 3000); // Poll every 3 seconds
        heartbeatId = setInterval(sendHeartbeat, 30000); // Heartbeat every 30 seconds
    }

    // Handle client disconnect
    req.on("close", () => {
        cleanup();
    });

    req.on("error", (err) => {
        console.error("SSE connection error:", err);
        cleanup();
    });
};
