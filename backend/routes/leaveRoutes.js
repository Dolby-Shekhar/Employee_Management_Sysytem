const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const controller = require("../controllers/leaveController");

// Employee routes
router.post("/", auth, controller.createLeave);
router.get("/my-leaves", auth, controller.getMyLeaves);

// Manager/Admin approval routes
router.get("/pending", auth, controller.getLeavesForApproval);
router.put("/:id/status", auth, controller.updateLeaveStatus);

// Dashboard summary
router.get("/summary", auth, controller.getLeaveSummary);

module.exports = router;
