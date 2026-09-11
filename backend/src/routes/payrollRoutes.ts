import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';
import { listPayrolls, createPayroll } from '../controllers/payrollController';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

const createPayrollSchema = z.object({
  employeeId: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  baseSalary: z.coerce.number().default(0),
  overtime: z.coerce.number().default(0),
  bonuses: z.coerce.number().default(0),
  deductions: z.coerce.number().default(0)
});

router.get('/', protect, authorize('admin', 'manager', 'employee'), validate(listQuerySchema, 'query'), listPayrolls);
router.post('/', protect, authorize('admin', 'manager'), validate(createPayrollSchema), createPayroll);

export default router;
