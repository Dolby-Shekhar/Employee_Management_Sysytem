const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 10,
  message: { message: "Too many attempts, please try again in 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// API Routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// Health check (API only)
app.get("/api/health", (req, res) => {
  res.json({ message: "Employee Management API is running", status: "ok" });
});

// Serve React frontend if build exists
const buildPath = path.join(__dirname, "../frontend/build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  // Fallback if no frontend build exists
  app.get("/", (req, res) => {
    res.json({ message: "API is running. Frontend build not found.", status: "ok" });
  });
}

// Error handler (must be last)
app.use(errorHandler);

// 404 handler for API routes only
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
