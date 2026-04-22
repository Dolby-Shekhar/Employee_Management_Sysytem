const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const auth = require("../middleware/authMiddleware");

// Employee routes
router.post("/clock-in", auth, attendanceController.clockIn);
router.post("/clock-out", auth, attendanceController.clockOut);

// Admin route
router.get("/all", auth, attendanceController.getAllAttendance);
router.get("/my", auth, attendanceController.getMyAttendance);

module.exports = router;
