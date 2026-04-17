const express = require("express");
const router = express.Router(); // ✅ THIS LINE WAS MISSING

const controller = require("../controllers/employeeController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Routes
router.get("/", auth, admin, controller.getEmployees);
router.post("/", auth, admin, controller.createEmployee);
router.post("/add-admin", auth, admin, controller.addAdmin); // Only admin can add admin, max 2
router.put("/:id", auth, admin, controller.updateEmployee);
router.delete("/:id", auth, admin, controller.deleteEmployee);

module.exports = router;