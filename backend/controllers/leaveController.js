const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
const createLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason, days } = req.body;

    // Validation
    if (!type || !startDate || !endDate || !reason || !days) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find manager
    let managerId = employee.managerId;
    if (!managerId) {
      // If no manager assigned, find any manager or admin
      const manager = await Employee.findOne({ role: 'manager' });
      if (manager) managerId = manager._id;
    }

    const leave = await Leave.create({
      employeeId: req.user.id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days: parseInt(days),
      reason,
      managerId: managerId || null
    });

    await leave.populate('employeeId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get leaves for approval
// @route   GET /api/leaves/pending
// @access  Private (Manager/Admin)
const getLeavesForApproval = async (req, res) => {
  try {
    let query = { status: 'pending' };

    if (req.user.role === 'manager') {
      // Get manager's team members
      const teamMembers = await Employee.find({ managerId: req.user.id });
      const teamIds = teamMembers.map(e => e._id.toString());
      query.employeeId = { $in: teamIds };
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all leaves (admin)
// @route   GET /api/leaves/all
// @access  Private (Admin)
const getAllLeaves = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [leaves, total] = await Promise.all([
      Leave.find()
        .populate('employeeId', 'name email department')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Leave.countDocuments()
    ]);

    res.json({
      success: true,
      count: leaves.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: leaves
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id/status
// @access  Private (Manager only - must be the assigned manager)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Please provide valid status (approved/rejected)' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only the assigned manager can approve/reject
    // Admins cannot approve/reject leaves - only managers can
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Only the assigned manager can approve or reject leave requests' });
    }

    if (req.user.role === 'manager') {
      // Check if this manager is the assigned manager for this leave
      if (leave.managerId && leave.managerId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not the assigned manager for this employee' });
      }
      
      // If no manager assigned, check if this manager manages the employee
      if (!leave.managerId) {
        const teamMembers = await Employee.find({ managerId: req.user.id });
        const teamIds = teamMembers.map(e => e._id.toString());
        if (!teamIds.includes(leave.employeeId.toString())) {
          return res.status(403).json({ message: 'Not authorized to manage this leave' });
        }
      }
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save();

    await leave.populate('employeeId approvedBy', 'name email');

    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get leave summary
// @route   GET /api/leaves/summary
// @access  Private
const getLeaveSummary = async (req, res) => {
  try {
    let match = {};
    if (req.user.role === 'manager') {
      const teamMembers = await Employee.find({ managerId: req.user.id });
      const teamIds = teamMembers.map(e => e._id);
      match = { employeeId: { $in: teamIds } };
    }

    const summary = await Leave.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLeaves = await Leave.countDocuments(match);
    const pendingLeaves = await Leave.countDocuments({ ...match, status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ ...match, status: 'approved' });
    const rejectedLeaves = await Leave.countDocuments({ ...match, status: 'rejected' });

    res.json({
      success: true,
      data: {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
        breakdown: summary
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createLeave,
  getMyLeaves,
  getLeavesForApproval,
  getAllLeaves,
  updateLeaveStatus,
  getLeaveSummary
};

