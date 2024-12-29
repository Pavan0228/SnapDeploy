import { getLogsFromClickhouse } from "../services/clickhouse.service.js";

export const getLogs = async (req, res) => {
    const id = req.params.id;
    try {
        const logs = await getLogsFromClickhouse(id);
        return res.json({ logs });
    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch logs",
            message: error.message,
        });
    }
};