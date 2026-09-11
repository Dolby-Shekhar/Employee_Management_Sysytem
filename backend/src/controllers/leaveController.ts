import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Leave } from '../models/Leave';
import { Employee } from '../models/Employee';
import { emitToUser } from '../utils/socket';
import { sendMail } from '../utils/notifications';

export const listLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const skip = (page - 1) * limit;

    let query: Record<string, unknown> = {};
    if (req.user?.role === 'manager') {
      // Scoped to the manager's direct team via the Employee.managerId field.
      const team = await Employee.find({ managerId: req.user.id }).select('_id');
      const employeeIds = team.map((e) => e._id);
      query = { employeeId: { $in: employeeIds } };
    } else if (req.user?.role === 'employee') {
      query = { employeeId: req.user.id };
    }

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .populate('employeeId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Leave.countDocuments(query)
    ]);

    res.json({ success: true, data: leaves, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list leaves' });
  }
};

export const createLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payload = await Leave.create({
      employeeId: req.user?.id,
      leaveType: req.body.leaveType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      reason: req.body.reason,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Leave requested', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create leave request' });
  }
};

export const approveLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      res.status(404).json({ success: false, message: 'Leave request not found' });
      return;
    }

    leave.status = req.body.status === 'rejected' ? 'rejected' : 'approved';
    if (req.body.managerComment) {
      leave.managerComment = req.body.managerComment;
    }
    await leave.save();

    // Real-time push to the requesting employee's connected client.
    emitToUser(String(leave.employeeId), 'leave:updated', leave);

    // Fire-and-forget email notification (does not block the response).
    const requester = await Employee.findById(leave.employeeId).select('name email');
    if (requester?.email) {
      sendMail(
        requester.email,
        `Leave ${leave.status}`,
        `<h3>Your leave request (${leave.leaveType}) has been <strong>${leave.status}</strong>.</h3>
         <p>${leave.startDate.toISOString().slice(0, 10)} to ${leave.endDate.toISOString().slice(0, 10)}</p>`
      );
    }

    res.json({ success: true, message: 'Leave updated', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update leave' });
  }
};
