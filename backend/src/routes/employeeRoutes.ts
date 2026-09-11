import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';
import { listEmployees, getEmployeeById, createEmployee, updateEmployee, approveEmployee, deleteEmployee } from '../controllers/employeeController';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['pending', 'approved']).optional(),
  role: z.enum(['admin', 'manager', 'employee']).optional()
});

const idParamSchema = z.object({
  id: z.string().min(1)
});

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'manager', 'employee']).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  salary: z.coerce.number().optional(),
  managerId: z.string().nullable().optional()
});

const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['admin', 'manager', 'employee']).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  salary: z.coerce.number().optional(),
  managerId: z.string().nullable().optional(),
  status: z.enum(['pending', 'approved']).optional()
});

router.get('/', protect, authorize('admin', 'manager', 'employee'), validate(listQuerySchema, 'query'), listEmployees);
router.get('/:id', protect, authorize('admin', 'manager', 'employee'), validate(idParamSchema, 'params'), getEmployeeById);
router.post('/', protect, authorize('admin'), validate(createEmployeeSchema), createEmployee);
router.put('/:id', protect, authorize('admin', 'manager'), validate(idParamSchema, 'params'), validate(updateEmployeeSchema), updateEmployee);
router.put('/:id/approve', protect, authorize('admin'), validate(idParamSchema, 'params'), approveEmployee);
router.delete('/:id', protect, authorize('admin'), validate(idParamSchema, 'params'), deleteEmployee);

export default router;
