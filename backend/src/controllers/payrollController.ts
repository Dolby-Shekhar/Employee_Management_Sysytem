import { Response } from 'express';
import { Decimal } from 'decimal.js';
import { AuthRequest } from '../middleware/auth';
import { Payroll } from '../models/Payroll';
import { Employee } from '../models/Employee';
import { emitToUser } from '../utils/socket';
import { sendMail } from '../utils/notifications';

export const listPayrolls = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const [payrolls, total] = await Promise.all([
      Payroll.find(query)
        .populate('employeeId', 'name email department position')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payroll.countDocuments(query)
    ]);

    res.json({ success: true, data: payrolls, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list payrolls' });
  }
};

export const createPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Decimal.js is used here to avoid floating-point rounding drift in salary math.
    const baseSalary = new Decimal(req.body.baseSalary ?? 0);
    const overtime = new Decimal(req.body.overtime ?? 0);
    const bonuses = new Decimal(req.body.bonuses ?? 0);
    const deductions = new Decimal(req.body.deductions ?? 0);
    const netPay = baseSalary.plus(overtime).plus(bonuses).minus(deductions);

    const payload = await Payroll.create({
      employeeId: req.body.employeeId ?? req.user?.id,
      month: req.body.month,
      year: req.body.year,
      baseSalary: baseSalary.toString(),
      overtime: overtime.toString(),
      bonuses: bonuses.toString(),
      deductions: deductions.toString(),
      netPay: netPay.toString()
    });

    // Real-time push to the employee whose payroll was generated.
    emitToUser(String(payload.employeeId), 'payroll:generated', payload);

    // Fire-and-forget email notification.
    const employee = await Employee.findById(payload.employeeId).select('name email');
    if (employee?.email) {
      sendMail(
        employee.email,
        `Payslip for ${payload.month}/${payload.year}`,
        `<h3>Your payslip for ${payload.month}/${payload.year} is ready.</h3>
         <p>Net pay: $${netPay.toFixed(2)}</p>`
      );
    }

    res.status(201).json({ success: true, message: 'Payroll generated', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate payroll' });
  }
};
