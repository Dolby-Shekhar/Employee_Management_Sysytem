import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/profileController';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  position: z.string().optional(),
  department: z.string().optional()
});

router.get('/', protect, getProfile);
router.put('/', protect, validate(updateProfileSchema), updateProfile);

export default router;
