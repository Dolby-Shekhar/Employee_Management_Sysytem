const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper function to reverse geocode coordinates to address
const reverseGeocode = async (lat, lng) => {
  if (!lat || !lng) return null;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'EmployeeManagementSystem/1.0'
        }
      }
    );
    const data = await response.json();
    if (data.address) {
      const parts = [];
      if (data.address.city || data.address.town || data.address.village || data.address.municipality) {
        parts.push(data.address.city || data.address.town || data.address.village || data.address.municipality);
      }
      if (data.address.state) {
        parts.push(data.address.state);
      }
      if (data.address.country) {
        parts.push(data.address.country);
      }
      return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',');
    }
    return null;
  } catch (err) {
    console.error('Reverse geocode error:', err.message);
    return null;
  }
};

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

    const position = req.body.location;
    
    if (existing) {
      existing.clockIn = { 
        time: now, 
        location: position 
      };
      existing.late = isLate;
      await existing.save();
      return res.json({ success: true, data: existing });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      clockIn: { 
        time: now, 
        location: position 
      },
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

    if (attendance.clockOut && attendance.clockOut.time) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    const now = new Date();
    // 6:00 PM is the cutoff for early leave
    const sixPM = new Date(now);
    sixPM.setHours(18, 0, 0, 0);
    const isEarly = now < sixPM;

    const position = req.body.location;

    attendance.clockOut = { 
      time: now, 
      location: position 
    };
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
      // Employee._id is aligned with User._id, so we can use it directly
      const teamUserIds = teamMembers.map(e => e._id.toString());
      query = { user: { $in: teamUserIds } };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('user', 'name email role')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query)
    ]);

    // Add addresses to each record
    const recordsWithAddress = await Promise.all(records.map(async (record) => {
      const clockInAddress = record.clockIn?.location ? await reverseGeocode(record.clockIn.location.lat, record.clockIn.location.lng) : null;
      const clockOutAddress = record.clockOut?.location ? await reverseGeocode(record.clockOut.location.lat, record.clockOut.location.lng) : null;

      return {
        ...record.toObject(),
        clockIn: record.clockIn ? { ...record.clockIn, address: clockInAddress } : null,
        clockOut: record.clockOut ? { ...record.clockOut, address: clockOutAddress } : null
      };
    }));

    res.json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: recordsWithAddress
    });

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

    // Add addresses to each record
    const recordsWithAddress = await Promise.all(records.map(async (record) => {
      const clockInAddress = record.clockIn?.location ? await reverseGeocode(record.clockIn.location.lat, record.clockIn.location.lng) : null;
      const clockOutAddress = record.clockOut?.location ? await reverseGeocode(record.clockOut.location.lat, record.clockOut.location.lng) : null;

      return {
        ...record.toObject(),
        clockIn: record.clockIn ? { ...record.clockIn, address: clockInAddress } : null,
        clockOut: record.clockOut ? { ...record.clockOut, address: clockOutAddress } : null
      };
    }));

    res.json({ success: true, count: records.length, data: recordsWithAddress });

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

    let response = record || { clockIn: null, clockOut: null, late: false, earlyLeave: false };

    if (record) {
      const clockInAddress = record.clockIn?.location ? await reverseGeocode(record.clockIn.location.lat, record.clockIn.location.lng) : null;
      const clockOutAddress = record.clockOut?.location ? await reverseGeocode(record.clockOut.location.lat, record.clockOut.location.lng) : null;

      response = {
        ...record.toObject(),
        clockIn: record.clockIn ? { ...record.clockIn, address: clockInAddress } : null,
        clockOut: record.clockOut ? { ...record.clockOut, address: clockOutAddress } : null
      };
    }

    res.json(response);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reset today's clock out (for testing/fixing issues)
// @route   POST /api/attendance/reset-clock-out
// @access  Private
const resetClockOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try multiple dates to find the record (in case of timezone issues)
    const dates = [today, new Date(today.getTime() + 86400000), new Date(today.getTime() - 86400000)];

    let attendance = null;
    for (const d of dates) {
      attendance = await Attendance.findOne({
        user: req.user.id,
        date: d
      });
      if (attendance) break;
    }

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found' });
    }

    // Set clockOut.time to null to allow clocking out again
    await Attendance.updateOne(
      { _id: attendance._id },
      { $set: { "clockOut.time": null, "clockOut.location": null, earlyLeave: false } }
    );

    res.json({ success: true, message: 'Clock out reset successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getAllAttendance,
  getMyAttendance,
  getTodayStatus,
  resetClockOut
};

