const Attendance = require("../models/Attendance");

// Clock In
exports.clockIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const existing = await Attendance.findOne({ user: req.user.id, date: today });
    if (existing && existing.clockIn) {
      return res.status(400).json({ message: "Already clocked in today" });
    }
    const now = new Date();
    // 10:00 AM today
    const tenAM = new Date(now);
    tenAM.setHours(10, 0, 0, 0);
    const isLate = now > tenAM;
    const attendance = await Attendance.create({
      user: req.user.id,
      clockIn: now,
      date: today,
      late: isLate
    });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Clock Out
exports.clockOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const attendance = await Attendance.findOne({ user: req.user.id, date: today });
    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ message: "Clock in first" });
    }
    if (attendance.clockOut) {
      return res.status(400).json({ message: "Already clocked out today" });
    }
    const now = new Date();
    // 6:00 PM today
    const sixPM = new Date(now);
    sixPM.setHours(18, 0, 0, 0);
    const isEarly = now < sixPM;
    attendance.clockOut = now;
    attendance.earlyLeave = isEarly;
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Get all attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate('user', 'name email');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get My Attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate('user', 'name');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

