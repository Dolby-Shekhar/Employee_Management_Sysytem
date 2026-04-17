const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { registerUser, loginUser } = require("../controllers/authController");

// Only admin can register new employees
router.post("/register", auth, admin, registerUser);
router.post("/login", loginUser);

module.exports = router;