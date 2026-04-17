const express = require("express");
const router = express.Router(); // ✅ THIS LINE WAS MISSING

const controller = require("../controllers/employeeController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Routes
router.get("/", auth, controller.getEmployees);
router.post("/", auth, controller.createEmployee);
router.post("/add-admin", auth, admin, controller.addAdmin);
router.put("/:id", auth, controller.updateEmployee);
router.delete("/:id", auth, admin, controller.deleteEmployee);
router.put("/:id/approve", auth, admin, controller.approveEmployee);

module.exports = router;