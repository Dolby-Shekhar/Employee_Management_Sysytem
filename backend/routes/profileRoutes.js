const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

// GET /api/profile - get current user profile
router.get("/", auth, profileController.getProfile);

// PUT /api/profile - update profile
router.put("/", auth, profileController.updateProfile);

module.exports = router;

