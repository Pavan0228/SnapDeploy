import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import { insertLogEvent } from "./clickhouse.service.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

const kafka = new Kafka({
    clientId: `api-server`,
    brokers: [process.env.KAFKA_BROKER],
    ssl: {
        ca: [readFileSync("./kafka.pem", "utf-8")],
    },
    sasl: {
        mechanism: "plain",
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
    },
    connectionTimeout: 10000,
    requestTimeout: 30000,
    retry: {
        initialRetryTime: 100,
        retries: 8,
    },
});

const consumer = kafka.consumer({
    groupId: "api-server-logs-consumer",
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
});

// Failed message queue for retry processing
const failedMessages = [];
const MAX_FAILED_MESSAGES = 1000;

// Process failed messages periodically
const processFailedMessages = async () => {
    if (failedMessages.length === 0) return;

    console.log(`Processing ${failedMessages.length} failed messages...`);
    const messagesToProcess = failedMessages.splice(0, 10); // Process 10 at a time

    for (const messageData of messagesToProcess) {
        try {
            await insertLogEvent(messageData);
            console.log(
                `Successfully processed failed message for deployment: ${messageData.deployment_id}`
            );
        } catch (error) {
            console.error(`Failed to process message again:`, error.message);
            // Re-add to failed queue if still failing, but limit queue size
            if (failedMessages.length < MAX_FAILED_MESSAGES) {
                failedMessages.push(messageData);
            }
        }
    }
};

// Start failed message processor
setInterval(processFailedMessages, 30000); // Process every 30 seconds

export async function initKafkaConsumer() {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: "container-logs" });

        await consumer.run({
            autoCommit: false,
            eachBatch: async ({
                batch,
                heartbeat,
                commitOffsetsIfNecessary,
                resolveOffset,
            }) => {
                const { messages } = batch;
                console.log("Received messages length", messages.length);

                for (const message of messages) {
                    try {
                        const stringMessage = message.value.toString();
                        const { DEPLOYMENT_ID, log, status } =
                            JSON.parse(stringMessage);

                        const logData = {
                            event_id: uuidv4(),
                            deployment_id: DEPLOYMENT_ID,
                            log,
                            status,
                        };

                        try {
                            await insertLogEvent(logData);
                            console.log(
                                `Successfully processed message for deployment: ${DEPLOYMENT_ID}`
                            );
                        } catch (clickhouseError) {
                            console.error(
                                `ClickHouse insert failed for deployment ${DEPLOYMENT_ID}:`,
                                clickhouseError.message
                            );

                            // Add to failed queue for retry
                            if (failedMessages.length < MAX_FAILED_MESSAGES) {
                                failedMessages.push(logData);
                                console.log(
                                    `Added message to failed queue. Queue size: ${failedMessages.length}`
                                );
                            } else {
                                console.warn(
                                    `Failed message queue is full. Dropping message for deployment: ${DEPLOYMENT_ID}`
                                );
                            }
                        }

                        // Always resolve offset and commit to avoid reprocessing
                        resolveOffset(message.offset);
                        await commitOffsetsIfNecessary(message.offset);
                        await heartbeat();
                    } catch (parseError) {
                        console.error(
                            "Failed to parse message:",
                            parseError.message
                        );
                        console.error(
                            "Message content:",
                            message.value.toString()
                        );

                        // Still resolve offset for unparseable messages
                        resolveOffset(message.offset);
                        await commitOffsetsIfNecessary(message.offset);
                    }
                }
            },
        });
    } catch (error) {
        console.error("Failed to connect to Kafka:", error);

        // Retry connection after a delay instead of exiting
        console.log("Retrying Kafka connection in 30 seconds...");
        setTimeout(() => {
            console.log("Attempting to reconnect to Kafka...");
            initKafkaConsumer();
        }, 30000);
    }
}
