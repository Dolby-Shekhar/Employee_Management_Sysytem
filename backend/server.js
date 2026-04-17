const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// =====================
// Middleware
// =====================
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
app.use(helmet()); // Security headers
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts, try again in 15 mins' },
  standardHeaders: true,
  legacyHeaders: false,
});

// =====================
// Routes
// =====================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));

// =====================
// Health Check Route (optional but useful)
// =====================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// =====================
// Error Handler (must be after routes)
// =====================
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// =====================
// MongoDB Connection
// =====================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop server if DB fails
  }
};

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});