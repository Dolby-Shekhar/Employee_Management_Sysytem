const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  approveEmployee,
  addAdmin,
  addManager
} = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const managerMiddleware = require('../middleware/managerMiddleware');

// All routes are protected
router.use(authMiddleware);

// Get all employees (role-based filtering)
router.get('/', getEmployees);

// Get single employee
router.get('/:id', getEmployee);

// Create employee (admin/manager)
router.post('/', managerMiddleware, createEmployee);

// Update employee
router.put('/:id', authMiddleware, updateEmployee);

// Approve employee (admin only)
router.put('/:id/approve', authMiddleware, approveEmployee);

// Add admin (admin only, max 2)
router.post('/add-admin', adminMiddleware, addAdmin);

// Add manager (admin only)
router.post('/add-manager', adminMiddleware, addManager);

// Delete employee (admin only)
router.delete('/:id', adminMiddleware, deleteEmployee);

module.exports = router;
