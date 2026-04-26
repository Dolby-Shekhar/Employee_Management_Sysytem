const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
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

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Employee Management API is running", status: "ok" });
});

// API Routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
