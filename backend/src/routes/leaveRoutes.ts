import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';
import { listLeaves, createLeave, approveLeave } from '../controllers/leaveController';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

const createLeaveSchema = z.object({
  leaveType: z.enum(['Sick', 'Casual', 'Annual', 'Emergency']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(1)
});

const updateLeaveSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  managerComment: z.string().optional()
});

const leaveIdSchema = z.object({
  id: z.string().min(1)
});

router.get('/', protect, authorize('admin', 'manager', 'employee'), validate(listQuerySchema, 'query'), listLeaves);
router.post('/', protect, authorize('admin', 'manager', 'employee'), validate(createLeaveSchema), createLeave);
router.put('/:id', protect, authorize('manager', 'admin'), validate(leaveIdSchema, 'params'), validate(updateLeaveSchema), approveLeave);

export default router;
