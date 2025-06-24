import {
    checkClickHouseHealth,
    getCircuitBreakerState,
} from "../services/clickhouse.service.js";

export const healthCheck = async (req, res) => {
    try {
        const clickhouseHealth = await checkClickHouseHealth();
        const circuitBreakerState = getCircuitBreakerState();

        const healthStatus = {
            status: clickhouseHealth.healthy ? "healthy" : "unhealthy",
            timestamp: new Date().toISOString(),
            services: {
                clickhouse: {
                    ...clickhouseHealth,
                    circuitBreaker: circuitBreakerState,
                },
                kafka: {
                    // We can't easily check Kafka health without more complex setup
                    // For now, we'll assume it's healthy if the service is running
                    healthy: true,
                    note: "Kafka health monitoring not implemented",
                },
            },
        };

        const statusCode = clickhouseHealth.healthy ? 200 : 503;
        res.status(statusCode).json(healthStatus);
    } catch (error) {
        res.status(500).json({
            status: "error",
            timestamp: new Date().toISOString(),
            error: error.message,
        });
    }
};

export const readinessCheck = async (req, res) => {
    try {
        const clickhouseHealth = await checkClickHouseHealth();

        if (clickhouseHealth.healthy) {
            res.status(200).json({
                status: "ready",
                timestamp: new Date().toISOString(),
            });
        } else {
            res.status(503).json({
                status: "not ready",
                timestamp: new Date().toISOString(),
                reason: "ClickHouse connection failed",
            });
        }
    } catch (error) {
        res.status(503).json({
            status: "not ready",
            timestamp: new Date().toISOString(),
            error: error.message,
        });
    }
};
