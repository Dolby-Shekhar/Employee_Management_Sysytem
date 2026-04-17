const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { registerUser, loginUser } = require("../controllers/authController");
const loginLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts, try again in 15 mins' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Only admin can register new employees
router.post("/register", auth, admin, registerUser);
router.post("/login", loginLimiter, loginUser);

module.exports = router;
