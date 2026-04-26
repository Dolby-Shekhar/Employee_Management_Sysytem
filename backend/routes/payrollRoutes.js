const express = require('express');
const router = express.Router();
const {
  generatePayroll,
  getAllPayrolls,
  getMyPayroll,
  markAsPaid,
  deletePayroll
} = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes are protected
router.use(authMiddleware);

// Employee route
router.get('/my', getMyPayroll);

// Admin routes
router.get('/', adminMiddleware, getAllPayrolls);
router.get('/all', adminMiddleware, getAllPayrolls);
router.post('/generate', adminMiddleware, generatePayroll);
router.put('/:id/pay', adminMiddleware, markAsPaid);
router.delete('/:id', adminMiddleware, deletePayroll);

module.exports = router;
