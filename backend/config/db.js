const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 3000) => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);

    if (retries > 0) {
      console.log(`⏳ Retrying connection in ${delay}ms... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error('❌ All MongoDB connection retries exhausted.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
