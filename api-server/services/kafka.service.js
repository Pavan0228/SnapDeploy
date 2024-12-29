import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import { client as clickhouseClient } from "./clickhouse.service.js";
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
});


const consumer = kafka.consumer({ groupId: "api-server-logs-consumer" });

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
                    const stringMessage = message.value.toString();
                    const { DEPLOYMENT_ID, log, status } = JSON.parse(stringMessage);
                    try {
                        const { query_id } = await clickhouseClient.insert({
                            table: 'log_events',
                            values: [{ event_id: uuidv4(), deployment_id: DEPLOYMENT_ID, log, status }],
                            format: 'JSONEachRow'
                        });
                        resolveOffset(message.offset);
                        await commitOffsetsIfNecessary(message.offset);
                        await heartbeat();
                    } catch (err) {
                        console.log(err);
                    }    
                }
            },
        });
    } catch (error) {
        console.error("Failed to connect to Kafka:", error);
        process.exit(1);
    }
}
