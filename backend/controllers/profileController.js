const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get my profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    let employee = await Employee.findById(req.user.id)
      .populate('managerId', 'name email')
      .select('-password');

    // Fallback: find by email if ID mismatch (for legacy data)
    if (!employee) {
      employee = await Employee.findOne({ email: req.user.email })
        .populate('managerId', 'name email')
        .select('-password');
    }

    if (!employee) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ success: true, data: employee });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update my profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, department, position, phone, address } = req.body;

    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update fields
    if (name) employee.name = name.trim();
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (phone) employee.phone = phone;
    if (address) employee.address = address;

    // Email update requires checking uniqueness
    if (email && email !== employee.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      employee.email = email.toLowerCase().trim();

      // Sync with User model by aligned _id
      await User.findByIdAndUpdate(req.user.id, { email: email.toLowerCase().trim() });
    }

    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name: name.trim() });
    }

    await employee.save();
    await employee.populate('managerId', 'name email');

    res.json({ success: true, message: 'Profile updated successfully', data: employee });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Also update Employee password by aligned _id
    await Employee.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
