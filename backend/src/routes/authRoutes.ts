import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from '../middleware/validate';
import { AuthRequest, protect } from '../middleware/auth';
import { Employee } from '../models/Employee';
import { User } from '../models/User';
import { ApiResponse, JwtPayload, Role } from '../types/common';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'employee']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const generateToken = (user: { _id: string | { toString(): string }; name: string; email: string; role: Role }): string => {
  const payload: JwtPayload = { id: String(user._id), name: user.name, email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
};

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, role } = req.body as { name: string; email: string; password: string; role?: Role };

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' } as ApiResponse<never>);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole: Role = role && ['admin', 'manager', 'employee'].includes(role) ? role : 'employee';

    const user = await User.create({ name, email, password: hashedPassword, role: normalizedRole });
    const status = normalizedRole === 'employee' ? 'pending' : 'approved';

    await Employee.create({
      _id: user._id,
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
      status,
      position: '',
      salary: 0,
      department: ''
    });

    const token = generateToken(user);
    res.status(201).json({ success: true, message: 'Registration successful', data: { token, user: { id: user._id, name, email, role: normalizedRole } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const employee = await Employee.findById(user._id);
    if (user.role !== 'admin' && employee?.status !== 'approved') {
      res.status(403).json({ success: false, message: 'Account pending approval' });
      return;
    }

    const token = generateToken(user);
    res.json({ success: true, message: 'Login successful', data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.get('/me', protect, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user?.id).select('-password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({
    success: true,
    data: {
      id: String(user._id),
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export default router;
