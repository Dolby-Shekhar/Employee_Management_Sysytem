const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Clock in
// @route   POST /api/attendance/clock-in
// @access  Private
const clockIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in
    const existing = await Attendance.findOne({
      user: req.user.id,
      date: today
    });

    if (existing && existing.clockIn) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    const now = new Date();
    // 10:00 AM is the cutoff for being late
    const tenAM = new Date(now);
    tenAM.setHours(10, 0, 0, 0);
    const isLate = now > tenAM;

    if (existing) {
      existing.clockIn = now;
      existing.late = isLate;
      await existing.save();
      return res.json({ success: true, data: existing });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      clockIn: now,
      date: today,
      late: isLate
    });

    res.status(201).json({ success: true, data: attendance });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Clock out
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today
    });

    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ message: 'Please clock in first' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    const now = new Date();
    // 6:00 PM is the cutoff for early leave
    const sixPM = new Date(now);
    sixPM.setHours(18, 0, 0, 0);
    const isEarly = now < sixPM;

    attendance.clockOut = now;
    attendance.earlyLeave = isEarly;
    await attendance.save();

    res.json({ success: true, data: attendance });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all attendance (admin/manager)
// @route   GET /api/attendance/all
// @access  Private (Admin/Manager)
const getAllAttendance = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'manager') {
      // Get manager's team members
      const teamMembers = await Employee.find({ managerId: req.user.id });
      // Attendance.user stores User IDs, not Employee IDs.
      // Find the corresponding User documents by email to get User IDs.
      const teamEmails = teamMembers.map(e => e.email);
      const User = require('../models/User');
      const teamUsers = await User.find({ email: { $in: teamEmails } });
      const teamUserIds = teamUsers.map(u => u._id.toString());
      query = { user: { $in: teamUserIds } };
    }

    const records = await Attendance.find(query)
      .populate('user', 'name email role')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id })
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({
      user: req.user.id,
      date: today
    });

    res.json(record || { clockIn: null, clockOut: null, late: false, earlyLeave: false });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getAllAttendance,
  getMyAttendance,
  getTodayStatus
};

