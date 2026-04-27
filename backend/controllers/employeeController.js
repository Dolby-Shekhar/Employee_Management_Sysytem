const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all employees (with role-based filtering)
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    if (role === 'manager') {
      // Managers see their team members
      query = { managerId: id };
    }
    // Admin sees all (no query filter)

    const employees = await Employee.find(query)
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('managerId', 'name email');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/Manager)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, position, salary } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Validate role
    let empRole = 'employee';
    if (role === 'admin' || role === 'manager') {
      empRole = role;
    }

    // Determine status based on creator role
    const status = req.user.role === 'admin' ? 'approved' : 'pending';
    const managerId = req.user.role === 'manager' ? req.user.id : req.body.managerId || null;

    // Create User
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: empRole
    });

    // Create Employee
    const employee = await Employee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: empRole,
      status,
      department: department || '',
      position: position || '',
      salary: salary || 0,
      managerId
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Authorization check
    if (req.user.role === 'manager' && employee.managerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this employee' });
    }

    // Don't allow password updates through this route
    const updateData = { ...req.body };
    delete updateData.password;

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Sync with User model if name/email changed
    if (updateData.name || updateData.email) {
      await User.findByIdAndUpdate(
        req.params.id,
        {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.email && { email: updateData.email })
        },
        { new: true }
      );
    }

    res.json({ success: true, data: updated });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Also delete associated User
    await User.findOneAndDelete({ email: employee.email });
    await Employee.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Employee deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Approve employee (admin only)
// @route   PUT /api/employees/:id/approve
// @access  Private (Admin)
const approveEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.status = 'approved';
    await employee.save();

    res.json({ success: true, message: 'Employee approved', data: employee });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add admin (admin only, max 2)
// @route   POST /api/employees/add-admin
// @access  Private (Admin)
const addAdmin = async (req, res) => {
  try {
    // Check admin count
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount >= 2) {
      return res.status(400).json({ message: 'Maximum of 2 admins allowed' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin'
    });

    // Create Employee
    const emp = await Employee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      status: 'approved',
      position: 'System Administrator'
    });

    res.status(201).json({
      success: true,
      message: 'Admin added successfully',
      data: { user, employee: emp }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add manager (admin only)
// @route   POST /api/employees/add-manager
// @access  Private (Admin)
const addManager = async (req, res) => {
  try {
    const { name, email, password, department, position } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'manager'
    });

    // Create Employee
    const emp = await Employee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'manager',
      status: 'approved',
      department: department || '',
      position: position || 'Team Manager'
    });

    res.status(201).json({
      success: true,
      message: 'Manager added successfully',
      data: { user, employee: emp }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  approveEmployee,
  addAdmin,
  addManager
};

