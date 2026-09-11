import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';
import { listReports, createReport, respondToReport } from '../controllers/reportController';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

const createReportSchema = z.object({
  employeeId: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1)
});

const respondReportSchema = z.object({
  managerResponse: z.string().min(1)
});

const idParamSchema = z.object({
  id: z.string().min(1)
});

router.get('/', protect, authorize('admin', 'manager', 'employee'), validate(listQuerySchema, 'query'), listReports);
router.post('/', protect, authorize('admin', 'manager', 'employee'), validate(createReportSchema), createReport);
router.put('/:id/respond', protect, authorize('admin', 'manager'), validate(idParamSchema, 'params'), validate(respondReportSchema), respondToReport);

export default router;
