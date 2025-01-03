const mongoose = require('mongoose');

const connectDB = async () => {
    const NAME = process.env.MONGO_DB_NAME;
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${NAME}`);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`fail to connect: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB };