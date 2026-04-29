const express = require('express');
const router = express.Router();
const {
  createReport,
  updateReport,
  getMyReports,
  getTeamReports,
  markAsRead
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Employee routes
router.post('/', authMiddleware, createReport);
router.get('/my', authMiddleware, getMyReports);
router.put('/:id', authMiddleware, updateReport);

// Manager routes  
router.get('/team', authMiddleware, getTeamReports);
router.put('/:id/read', authMiddleware, markAsRead);

module.exports = router;
