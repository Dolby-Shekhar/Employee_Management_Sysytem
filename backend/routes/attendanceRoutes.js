const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getAllAttendance,
  getMyAttendance,
  getTodayStatus,
  resetClockOut
} = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const managerMiddleware = require('../middleware/managerMiddleware');

// All routes are protected
router.use(authMiddleware);

// Clock in/out
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/reset-clock-out', resetClockOut);

// Get my attendance
router.get('/my', getMyAttendance);

// Get today's status
router.get('/today', getTodayStatus);

// Get all attendance (admin/manager)
router.get('/all', managerMiddleware, getAllAttendance);

module.exports = router;

