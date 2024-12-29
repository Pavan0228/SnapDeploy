import { config as _config } from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/index.js";

_config({
    path: "./.env",
});

const port = process.env.PORT || 9000;

// Connect to database and start server
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(
                ` ⚙️ Server is running on port http://localhost:${port}`
            );
        });
    })
    .catch((error) => {
        console.error(` ❌ fail to connect: ${error.message}`);
        process.exit(1);
    });

// Error handling
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
});
