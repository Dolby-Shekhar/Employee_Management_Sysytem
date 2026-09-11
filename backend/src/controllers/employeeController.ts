import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Employee } from '../models/Employee';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';
import { Payroll } from '../models/Payroll';
import { PerformanceReview } from '../models/PerformanceReview';
import { PaginatedResponse } from '../types/common';
import { emitToUser } from '../utils/socket';
import { sendMail } from '../utils/notifications';

import bcrypt from 'bcryptjs';

export const listEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const skip = (page - 1) * limit;
    const { search, department, status, role } = req.query as {
      search?: string;
      department?: string;
      status?: string;
      role?: string;
    };

    let query: Record<string, unknown> = {};
    if (req.user?.role === 'manager') {
      query = { managerId: req.user.id };
    } else if (req.user?.role === 'employee') {
      query = { _id: req.user.id };
    }

    if (department) {
      query.department = department;
    }
    if (status) {
      query.status = status;
    }
    if (role) {
      query.role = role;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { position: regex }];
    }

    const [employees, total] = await Promise.all([
      Employee.find(query).populate('managerId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Employee.countDocuments(query)
    ]);

    const payload: PaginatedResponse<unknown> = {
      success: true,
      data: employees,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list employees' });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id).populate('managerId', 'name email');
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get employee' });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department, position, salary, managerId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password || 'company123', 10);
    const assignedRole = role && ['admin', 'manager', 'employee'].includes(role) ? role : 'employee';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole
    });

    const employee = await Employee.create({
      _id: user._id,
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      status: 'approved',
      department: department || '',
      position: position || '',
      salary: Number(salary) || 0,
      managerId: managerId || null
    });

    res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { name, department, position, salary, role, managerId, status } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    if (name) employee.name = name;
    if (department !== undefined) employee.department = department;
    if (position !== undefined) employee.position = position;
    if (salary !== undefined) employee.salary = Number(salary);
    if (status && ['pending', 'approved'].includes(status)) employee.status = status;
    if (managerId !== undefined) employee.managerId = managerId ? managerId : null;
    if (role && ['admin', 'manager', 'employee'].includes(role)) employee.role = role;

    await employee.save();

    // Sync user model if name or role changed
    const userUpdate: Record<string, unknown> = {};
    if (name) userUpdate.name = name;
    if (role) userUpdate.role = role;
    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(id, userUpdate);
    }

    res.json({ success: true, message: 'Employee updated successfully', data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update employee' });
  }
};

export const approveEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

employee.status = 'approved';
    await employee.save();

    // Real-time push + email to the newly approved employee.
    emitToUser(String(employee._id), 'employee:approved', employee);
    if (employee.email) {
      sendMail(
        employee.email,
        'Account approved',
        `<h3>Welcome aboard, ${employee.name}!</h3><p>Your account has been approved. You can now sign in.</p>`
      );
    }

    res.json({ success: true, message: 'Employee approved', data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve employee' });
  }
};

// DELETE /api/v1/employees/:id - Cascade delete an employee and all related records.
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    // Remove all dependent records in parallel, then the User + Employee docs.
    await Promise.all([
      Attendance.deleteMany({ user: id }),
      Leave.deleteMany({ employeeId: id }),
      Payroll.deleteMany({ employeeId: id }),
      PerformanceReview.deleteMany({ employeeId: id }),
      User.findByIdAndDelete(id),
      Employee.findByIdAndDelete(id)
    ]);

    res.json({ success: true, message: 'Employee deleted with all related records' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete employee' });
  }
};
