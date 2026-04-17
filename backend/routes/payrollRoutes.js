const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { 
  generatePayroll, 
  getMyPayroll, 
  getTeamPayroll, 
  markPaid 
} = require("../controllers/payrollController");

// Employee routes
router.post("/:month/:year", auth, generatePayroll);
router.get("/my-payroll", auth, getMyPayroll);

// Manager/Admin team payroll
router.get("/team", auth, getTeamPayroll);

// Mark as paid (admin/manager)
router.patch("/:id/paid", auth, markPaid);

module.exports = router;
