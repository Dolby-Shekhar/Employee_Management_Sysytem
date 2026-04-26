const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getMyReviews,
  getTeamReviews,
  updateReview,
  deleteReview
} = require('../controllers/performanceController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const managerMiddleware = require('../middleware/managerMiddleware');

// All routes are protected
router.use(authMiddleware);

// Employee route
router.get('/my', getMyReviews);

// Manager routes
router.get('/team', managerMiddleware, getTeamReviews);
router.post('/', managerMiddleware, createReview);
router.put('/:id', managerMiddleware, updateReview);

// Admin routes
router.get('/', adminMiddleware, getAllReviews);
router.delete('/:id', adminMiddleware, deleteReview);

module.exports = router;

