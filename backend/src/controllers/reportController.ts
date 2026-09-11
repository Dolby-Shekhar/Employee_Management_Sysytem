import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Report } from '../models/Report';
import { Employee } from '../models/Employee';

export const listReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const skip = (page - 1) * limit;

    let query: Record<string, unknown> = {};
    if (req.user?.role === 'employee') {
      query = { employeeId: req.user.id };
    } else if (req.user?.role === 'manager') {
      const team = await Employee.find({ managerId: req.user.id }).select('_id');
      const teamIds = team.map((e) => e._id);
      query = { employeeId: { $in: [req.user.id, ...teamIds] } };
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('employeeId', 'name email department position')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query)
    ]);

    res.json({ success: true, data: reports, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list reports' });
  }
};

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payload = await Report.create({
      employeeId: req.body.employeeId ?? req.user?.id,
      title: req.body.title,
      content: req.body.content,
      createdBy: req.user?.id
    });

    res.status(201).json({ success: true, message: 'Report created', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create report' });
  }
};

export const respondToReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }
    report.managerResponse = req.body.managerResponse;
    await report.save();
    res.json({ success: true, message: 'Response added to report', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to respond to report' });
  }
};
