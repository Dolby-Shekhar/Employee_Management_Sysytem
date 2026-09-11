import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';
import { listReviews, createReview } from '../controllers/performanceController';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

const createReviewSchema = z.object({
  employeeId: z.string().optional(),
  reviewPeriod: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comments: z.string().optional()
});

router.get('/', protect, authorize('admin', 'manager', 'employee'), validate(listQuerySchema, 'query'), listReviews);
router.post('/', protect, authorize('admin', 'manager'), validate(createReviewSchema), createReview);

export default router;
