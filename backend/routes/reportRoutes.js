const express = require('express');
const router = express.Router();
const {
  createReport,
  updateReport,
  getMyReports,
  getTeamReports,
  markAsRead,
  respondToReport
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Employee routes
router.post('/', authMiddleware, createReport);
router.get('/my', authMiddleware, getMyReports);
router.put('/:id', authMiddleware, updateReport);

// Manager routes
router.get('/team', authMiddleware, getTeamReports);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/:id/respond', authMiddleware, respondToReport);

module.exports = router;
