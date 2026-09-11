import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PerformanceReview } from '../models/PerformanceReview';
import { Employee } from '../models/Employee';

export const listReviews = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const [reviews, total] = await Promise.all([
      PerformanceReview.find(query)
        .populate('employeeId', 'name email department position')
        .populate('managerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PerformanceReview.countDocuments(query)
    ]);

    res.json({ success: true, data: reviews, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list performance reviews' });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payload = await PerformanceReview.create({
      employeeId: req.body.employeeId ?? req.user?.id,
      reviewPeriod: req.body.reviewPeriod,
      rating: req.body.rating,
      comments: req.body.comments,
      managerId: req.user?.id,
      status: 'submitted'
    });

    res.status(201).json({ success: true, message: 'Performance review created', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create review' });
  }
};
