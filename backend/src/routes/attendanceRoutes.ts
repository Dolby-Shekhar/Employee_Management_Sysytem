import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';
import { clockIn, clockOut, getAttendanceStatus, listAttendance } from '../controllers/attendanceController';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

const clockInSchema = z.object({
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

router.get('/status', protect, getAttendanceStatus);
router.get('/', protect, authorize('admin', 'manager', 'employee'), validate(listQuerySchema, 'query'), listAttendance);
router.post('/clock-in', protect, validate(clockInSchema), clockIn);
router.post('/clock-out', protect, clockOut);

export default router;
