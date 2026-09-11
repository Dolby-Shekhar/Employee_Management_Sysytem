import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Employee } from '../models/Employee';

// GET /api/v1/profile - Fetch the authenticated user's profile with HR data.
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const employee = await Employee.findById(req.user?.id).select('-password');
    res.json({
      success: true,
      data: {
        user,
        employee: employee ?? null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// PUT /api/v1/profile - Update the authenticated user's profile fields.
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, position, department, salary } = req.body as {
      name?: string;
      position?: string;
      department?: string;
      salary?: number;
    };

    // Only admin/manager are allowed to change salary (privilege escalation guard).
    const canEditSalary = req.user?.role === 'admin' || req.user?.role === 'manager';

    const updateUser: Record<string, unknown> = {};
    if (name) updateUser.name = name;

    const updateEmployee: Record<string, unknown> = {};
    if (position) updateEmployee.position = position;
    if (department) updateEmployee.department = department;
    if (typeof salary === 'number' && canEditSalary) updateEmployee.salary = salary;

    const user = await User.findByIdAndUpdate(req.user?.id, updateUser, { new: true }).select('-password');
    // Employees may not have a profile record in all cases; tolerate missing.
    const employee = await Employee.findByIdAndUpdate(req.user?.id, updateEmployee, { new: true }).select('-password');

    res.json({
      success: true,
      message: 'Profile updated',
      data: { user, employee }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
