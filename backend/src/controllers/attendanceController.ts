import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Attendance } from '../models/Attendance';

import { Employee } from '../models/Employee';

export const getAttendanceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const active = await Attendance.findOne({ user: req.user?.id, clockOut: null });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayRecords = await Attendance.find({
      user: req.user?.id,
      clockIn: { $gte: startOfDay }
    }).sort({ clockIn: -1 });

    res.json({
      success: true,
      data: {
        clockedIn: !!active,
        activeSession: active || null,
        todayRecords
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance status' });
  }
};

export const listAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const skip = (page - 1) * limit;

    let query: Record<string, unknown> = {};

    if (req.user?.role === 'employee') {
      query = { user: req.user.id };
    } else if (req.user?.role === 'manager') {
      const team = await Employee.find({ managerId: req.user.id }).select('_id');
      const teamIds = team.map((e) => e._id);
      query = { user: { $in: [req.user.id, ...teamIds] } };
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('user', 'name email role')
        .sort({ clockIn: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: records,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list attendance records' });
  }
};

export const clockIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Attendance.findOne({ user: req.user?.id, clockOut: null });
    if (existing) {
      res.status(409).json({ success: false, message: 'Already clocked in' });
      return;
    }

    const attendance = await Attendance.create({
      user: req.user?.id,
      clockIn: new Date(),
      late: new Date().getHours() >= 10,
      address: req.body.address || '',
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });

    res.status(201).json({ success: true, message: 'Clocked in', data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clock in' });
  }
};

export const clockOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attendance = await Attendance.findOne({ user: req.user?.id, clockOut: null });
    if (!attendance) {
      res.status(404).json({ success: false, message: 'No active session found' });
      return;
    }

    attendance.clockOut = new Date();
    attendance.earlyLeave = attendance.clockOut.getHours() < 18;
    await attendance.save();
    res.json({ success: true, message: 'Clocked out', data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clock out' });
  }
};
