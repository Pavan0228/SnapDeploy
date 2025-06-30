const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const { Kafka } = require("kafkajs");

require("dotenv").config({
    path: path.join(__dirname, ".env"),
});

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const PROJECT_ID = process.env.PROJECT_ID;
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;
const FRONTEND_PATH = process.env.FRONTEND_PATH || "./";

// Extract user-defined environment variables (exclude system variables)
const SYSTEM_ENV_VARS = new Set([
    "PROJECT_ID",
    "DEPLOYMENT_ID",
    "FRONTEND_PATH",
    "GIT_REPOSITORY__URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_BUCKET_NAME",
    "KAFKA_BROKER",
    "KAFKA_USERNAME",
    "KAFKA_PASSWORD",
]);

function getUserEnvironmentVariables() {
    const userEnvVars = {};
    for (const [key, value] of Object.entries(process.env)) {
        if (
            !SYSTEM_ENV_VARS.has(key) &&
            !key.startsWith("npm_") &&
            !key.startsWith("_")
        ) {
            userEnvVars[key] = value;
        }
    }
    return userEnvVars;
}

async function createEnvFile(buildDir) {
    try {
        const userEnvVars = getUserEnvironmentVariables();

        if (Object.keys(userEnvVars).length === 0) {
            await publishMessage(
                "No user environment variables found",
                "running"
            );
            return;
        }

        const envFilePath = path.join(buildDir, ".env");
        const envContent = Object.entries(userEnvVars)
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");

        fs.writeFileSync(envFilePath, envContent);
        await publishMessage(
            `.env file created with user-defined environment variables`,
            "running"
        );
    } catch (error) {
        await publishMessage(
            `Failed to create .env file: ${error.message}`,
            "running"
        );
        throw error;
    }
}

const kafka = new Kafka({
    clientId: `build-server-${DEPLOYMENT_ID}`,
    brokers: [process.env.KAFKA_BROKER],
    ssl: {
        ca: [fs.readFileSync(path.join(__dirname, "kafka.pem"), "utf-8")],
    },
    sasl: {
        mechanism: "plain",
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
    },
});

// Set environment variable to suppress KafkaJS partitioner warning
process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";

const producer = kafka.producer();

async function publishMessage(log, status = "running") {
    try {
        await producer.send({
            topic: `container-logs`,
            messages: [
                {
                    key: "log",
                    value: JSON.stringify({
                        PROJECT_ID,
                        DEPLOYMENT_ID,
                        log,
                        status,
                    }),
                },
            ],
        });
        console.log(`[${status.toUpperCase()}] ${log}`);
    } catch (error) {
        console.error("Failed to publish message:", error);
    }
}

async function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

async function cleanupBeforeBuild(outDirPath) {
    const buildDir = path.join(outDirPath, FRONTEND_PATH);
    const nodeModulesPath = path.join(buildDir, "node_modules");
    const packageLockPath = path.join(buildDir, "package-lock.json");

    // Remove node_modules and package-lock.json if they exist to ensure clean install
    if (fs.existsSync(nodeModulesPath)) {
        await publishMessage("Cleaning previous node_modules...", "running");
        fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    }

    if (fs.existsSync(packageLockPath)) {
        fs.unlinkSync(packageLockPath);
    }
}

function executeBuild(outDirPath) {
    return new Promise(async (resolve, reject) => {
        // Determine the actual build directory based on frontend path
        const buildDir = path.join(outDirPath, FRONTEND_PATH);

        if (!fs.existsSync(buildDir)) {
            reject(
                new Error(
                    `Frontend path '${FRONTEND_PATH}' does not exist in the repository`
                )
            );
            return;
        }

        // Check if package.json exists in the build directory
        const packageJsonPath = path.join(buildDir, "package.json");
        if (!fs.existsSync(packageJsonPath)) {
            reject(
                new Error(
                    `No package.json found in frontend path '${FRONTEND_PATH}'. Please ensure this is the correct path to your frontend code.`
                )
            );
            return;
        }

        // Create .env file with user-defined environment variables
        try {
            await createEnvFile(buildDir);
        } catch (error) {
            reject(error);
            return;
        }

        // Try different npm install strategies to handle ERESOLVE errors
        const installCommands = [
            "npm install --legacy-peer-deps",
            "npm install --force",
            "npm install",
        ];

        let currentCommandIndex = 0;

        function tryInstall() {
            if (currentCommandIndex >= installCommands.length) {
                reject(new Error("All npm install strategies failed"));
                return;
            }

            const installCommand = installCommands[currentCommandIndex];
            const buildCommand = `cd ${buildDir} && ${installCommand} && npm run build`;

            if (currentCommandIndex > 0) {
                void publishMessage(
                    `Retrying with different strategy: ${installCommand}`,
                    "running"
                );
            }

            const buildProcess = exec(buildCommand);

            let buildOutput = [];
            let hasError = false;
            let installFailed = false;

            buildProcess.stdout.on("data", (data) => {
                const message = data.toString().trim();

                // Filter out verbose npm output and only show important messages
                if (shouldLogMessage(message)) {
                    buildOutput.push(message);
                    // Only publish significant build messages
                    if (isSignificantMessage(message)) {
                        void publishMessage(
                            formatBuildMessage(message),
                            "running"
                        );
                    }
                }
            });

            buildProcess.stderr.on("data", (data) => {
                const error = data.toString().trim();

                // Check for ERESOLVE errors specifically
                if (error.includes("ERESOLVE") || error.includes("peer dep")) {
                    installFailed = true;
                    void publishMessage(
                        `Dependency conflict detected, trying alternative strategy...`,
                        "running"
                    );
                } else if (isActualError(error)) {
                    hasError = true;
                    void publishMessage(`Build error: ${error}`, "failed");
                }
            });

            buildProcess.on("error", (error) => {
                void publishMessage(
                    `Build process failed: ${error.message}`,
                    "failed"
                );
                reject(error);
            });

            buildProcess.on("close", (code) => {
                if (
                    code !== 0 &&
                    installFailed &&
                    currentCommandIndex < installCommands.length - 1
                ) {
                    // Try next install strategy
                    currentCommandIndex++;
                    tryInstall();
                    return;
                }

                if (code !== 0 || hasError) {
                    const error = new Error(
                        `Build failed with exit code ${code}`
                    );
                    void publishMessage(
                        `Build failed with exit code ${code}`,
                        "failed"
                    );
                    reject(error);
                    return;
                }
                resolve();
            });
        }

        tryInstall();
    });
}

// Helper functions to filter build output
function shouldLogMessage(message) {
    const skipPatterns = [
        /^npm WARN/,
        /^added \d+ packages/,
        /^found \d+ vulnerabilities/,
        /^run `npm audit/,
        /^\s*$/,
        /^> /,
    ];

    return !skipPatterns.some((pattern) => pattern.test(message));
}

function isSignificantMessage(message) {
    const significantPatterns = [
        /installing/i,
        /building/i,
        /compiling/i,
        /bundling/i,
        /optimizing/i,
        /built/i,
        /completed/i,
        /success/i,
    ];

    return significantPatterns.some((pattern) => pattern.test(message));
}

function formatBuildMessage(message) {
    // Clean up and format build messages for better readability
    if (message.includes("Installing")) return "Installing dependencies...";
    if (message.includes("Building")) return "Building application...";
    if (message.includes("Compiling")) return "Compiling source code...";
    if (message.includes("Bundling")) return "Bundling assets...";
    if (message.includes("Optimizing")) return "Optimizing build...";

    return message;
}

function isActualError(error) {
    const warningPatterns = [
        /npm WARN/,
        /warning/i,
        /deprecated/i,
        /peer dep/i,
    ];

    // Don't treat ERESOLVE as a fatal error initially, let the retry logic handle it
    const retriableErrorPatterns = [
        /ERESOLVE/,
        /peer dependency/i,
        /conflicting peer dependency/i,
    ];

    const isWarning = warningPatterns.some((pattern) => pattern.test(error));
    const isRetriable = retriableErrorPatterns.some((pattern) =>
        pattern.test(error)
    );

    return !isWarning && !isRetriable;
}

async function uploadDistFolder(distFolderPath) {
    if (!fs.existsSync(distFolderPath)) {
        throw new Error("Build output folder not found");
    }

    const distFolderContents = fs.readdirSync(distFolderPath, {
        recursive: true,
    });

    // Filter out directories
    const files = distFolderContents.filter((file) => {
        const filePath = path.join(distFolderPath, file);
        return !fs.lstatSync(filePath).isDirectory();
    });

    if (files.length === 0) {
        throw new Error("No files found to upload");
    }

    let uploadedCount = 0;
    for (const file of files) {
        const filePath = path.join(distFolderPath, file);
        const s3Key = `__outputs/${PROJECT_ID}/${file}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: fs.createReadStream(filePath),
            ContentType: mime.lookup(filePath),
        });

        await s3Client.send(command);
        uploadedCount++;

        // Show progress for larger uploads
        if (
            files.length > 5 &&
            uploadedCount % Math.ceil(files.length / 4) === 0
        ) {
            const progress = Math.round((uploadedCount / files.length) * 100);
            await publishMessage(
                `Upload progress: ${progress}% (${uploadedCount}/${files.length} files)`,
                "running"
            );
        }
    }
}

async function init() {
    try {
        await producer.connect();
        await publishMessage("Deployment started", "running");
        await publishMessage(
            `Using frontend path: ${FRONTEND_PATH}`,
            "running"
        );

        const outDirPath = path.join(__dirname, "output");
        await ensureDirectoryExists(outDirPath);

        // Clean up any previous build artifacts
        await cleanupBeforeBuild(outDirPath);

        // Build phase
        await publishMessage(
            "Installing dependencies and building application...",
            "running"
        );
        await executeBuild(outDirPath);
        await publishMessage("Build completed successfully", "running");

        // Upload phase - try different common build output directories
        const buildDir = path.join(__dirname, "output", FRONTEND_PATH);
        const possibleDistPaths = [
            path.join(buildDir, "dist"),
            path.join(buildDir, "build"),
            path.join(buildDir, "out"),
            buildDir, // fallback to build directory itself
        ];

        let distFolderPath = null;
        for (const possiblePath of possibleDistPaths) {
            if (fs.existsSync(possiblePath)) {
                const files = fs.readdirSync(possiblePath);
                // Check if this directory contains built files (html, js, css, etc.)
                const hasBuiltFiles = files.some(
                    (file) =>
                        file.endsWith(".html") ||
                        file.endsWith(".js") ||
                        file.endsWith(".css") ||
                        fs
                            .lstatSync(path.join(possiblePath, file))
                            .isDirectory()
                );
                if (hasBuiltFiles) {
                    distFolderPath = possiblePath;
                    await publishMessage(
                        `Found build output in: ${
                            path.relative(buildDir, possiblePath) || "root"
                        }`,
                        "running"
                    );
                    break;
                }
            }
        }

        if (!distFolderPath) {
            throw new Error(
                "No build output directory found. Checked: dist/, build/, out/, and root directory"
            );
        }

        await publishMessage("Uploading files to cloud storage...", "running");
        await uploadDistFolder(distFolderPath);

        // Completion - This should be the LAST message
        await publishMessage(
            "🎉 Deployment completed! Your website is now live",
            "completed"
        );
        await producer.disconnect();
        process.exit(0);
    } catch (error) {
        await publishMessage(`Deployment failed: ${error.message}`, "failed");
        await producer.disconnect();
        process.exit(1);
    }
}

init().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
