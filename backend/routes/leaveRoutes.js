const express = require('express');
const router = express.Router();
const {
  createLeave,
  getMyLeaves,
  getLeavesForApproval,
  getAllLeaves,
  updateLeaveStatus,
  getLeaveSummary
} = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const managerMiddleware = require('../middleware/managerMiddleware');

// All routes are protected
router.use(authMiddleware);

// Employee routes
router.post('/', createLeave);
router.get('/my', getMyLeaves);

// Manager/Admin routes
router.get('/approval', managerMiddleware, getLeavesForApproval);
router.get('/all', adminMiddleware, getAllLeaves);
router.get('/summary', managerMiddleware, getLeaveSummary);
router.put('/:id/status', managerMiddleware, updateLeaveStatus);
router.patch('/:id/status', managerMiddleware, updateLeaveStatus);

module.exports = router;

