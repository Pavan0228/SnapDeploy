import { createClient } from "@clickhouse/client";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
})

export const client = createClient({
    host: process.env.CLICKHOUSE_HOST,
    database: "default",
    username: process.env.CLICKHOUSE_USER,
    password: process.env.CLICKHOUSE_PASSWORD,
});

export const getLogsFromClickhouse = async (deploymentId) => {
    const logs = await client.query({
        query: `SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id = {deployment_id:String}`,
        query_params: {
            deployment_id: deploymentId
        },
        format: 'JSONEachRow'
    });

    return logs.json();
};