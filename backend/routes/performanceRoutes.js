const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { 
  createSelfReview,
  getMyReviews,
  submitManagerReview,
  getTeamReviews 
} = require("../controllers/performanceController");

// Employee self-review
router.post("/self-review", auth, createSelfReview);
router.get("/my-reviews", auth, getMyReviews);

// Manager reviews team
router.post("/manager-review", auth, submitManagerReview);
router.get("/team-reviews", auth, getTeamReviews);

module.exports = router;
