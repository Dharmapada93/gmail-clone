const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`[DB] Attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`[DB] Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('[DB] All connection attempts failed. Server will run without DB.');
        // Do NOT exit — let the server stay up so the process doesn't crash-loop
      }
    }
  }
};

module.exports = connectDB;
