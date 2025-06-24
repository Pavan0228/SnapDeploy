import { createClient } from "@clickhouse/client";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

export const client = createClient({
    host: process.env.CLICKHOUSE_HOST,
    database: "default",
    username: process.env.CLICKHOUSE_USER,
    password: process.env.CLICKHOUSE_PASSWORD,
    connect_timeout: 10000,
    request_timeout: 30000,
    max_open_connections: 10,
    compression: {
        response: true,
        request: false,
    },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper function with circuit breaker
const withRetry = async (operation, maxRetries = MAX_RETRIES) => {
    return await circuitBreaker.execute(async () => {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.error(
                    `Attempt ${attempt}/${maxRetries} failed:`,
                    error.message
                );

                // If it's the last attempt, throw the error
                if (attempt === maxRetries) {
                    throw error;
                }

                // Wait before retrying (exponential backoff)
                const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
                await sleep(delay);
            }
        }

        throw lastError;
    });
};

// Circuit breaker configuration
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    }

    async execute(operation) {
        if (this.state === "OPEN") {
            if (Date.now() - this.lastFailureTime < this.timeout) {
                throw new Error(
                    "Circuit breaker is OPEN - ClickHouse appears to be down"
                );
            }
            this.state = "HALF_OPEN";
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = "CLOSED";
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.threshold) {
            this.state = "OPEN";
            console.warn(
                `Circuit breaker opened after ${this.failureCount} failures`
            );
        }
    }

    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime,
        };
    }
}

const circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30 second timeout

export const getLogsFromClickhouse = async (deploymentId) => {
    return await withRetry(async () => {
        const logs = await client.query({
            query: `SELECT event_id, deployment_id, log, timestamp, status 
                    FROM log_events 
                    WHERE deployment_id = {deployment_id:String} 
                    ORDER BY timestamp ASC`,
            query_params: {
                deployment_id: deploymentId,
            },
            format: "JSONEachRow",
        });

        return logs.json();
    });
};

export const getLatestLogStatus = async (deploymentId) => {
    return await withRetry(async () => {
        const result = await client.query({
            query: `SELECT status 
                    FROM log_events 
                    WHERE deployment_id = {deployment_id:String} 
                    ORDER BY timestamp DESC 
                    LIMIT 1`,
            query_params: {
                deployment_id: deploymentId,
            },
            format: "JSONEachRow",
        });

        const logs = await result.json();
        return logs.length > 0 ? logs[0].status : null;
    });
};

export const insertLogEvent = async (logData) => {
    return await withRetry(async () => {
        const result = await client.insert({
            table: "log_events",
            values: [logData],
            format: "JSONEachRow",
        });
        return result;
    });
};

// Health check function
export const checkClickHouseHealth = async () => {
    try {
        const result = await client.query({
            query: "SELECT 1 as health_check",
            format: "JSONEachRow",
        });

        await result.json();
        return { healthy: true, timestamp: new Date().toISOString() };
    } catch (error) {
        console.error("ClickHouse health check failed:", error.message);
        return {
            healthy: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        };
    }
};

// Monitor connection health periodically
let healthCheckInterval;
export const startHealthMonitoring = () => {
    // Check health every 60 seconds
    healthCheckInterval = setInterval(async () => {
        const health = await checkClickHouseHealth();
        if (!health.healthy) {
            console.warn("ClickHouse connection unhealthy:", health.error);
        } else {
            console.log("ClickHouse connection healthy");
        }
    }, 60000);
};

export const stopHealthMonitoring = () => {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
};

// Start monitoring when module loads
startHealthMonitoring();

// Export circuit breaker state for monitoring
export const getCircuitBreakerState = () => circuitBreaker.getState();
