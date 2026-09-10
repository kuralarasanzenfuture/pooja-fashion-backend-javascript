import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  create,
  update,
  uploadPhoto,
  deletePhoto,
  updateStatus,
  deleteEmployee,
} from './employee.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { verifyToken, adminOnly } from '../../middlewares/auth.middleware.js';
import { employeePhotoUpload } from './employee.middleware.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateStatusSchema,
  employeeIdParamSchema,
  getEmployeesQuerySchema,
} from './employee.validation.js';

const router = Router();

// GET /api/employees - List employees with pagination, multi-tenant filtering, & search
router.get('/', verifyToken, adminOnly, validate(getEmployeesQuerySchema, 'query'), getAll);

// GET /api/employees/code/:companyId/:employeeCode - Get employee by company and code
router.get('/code/:companyId/:employeeCode', verifyToken, getByCode);

// GET /api/employees/:id - Get employee details by ID
router.get('/:id', verifyToken, validate(employeeIdParamSchema, 'params'), getById);

// POST /api/employees - Create new employee (Supports JSON or multipart/form-data with photo)
router.post(
  '/',
  verifyToken,
  adminOnly,
  employeePhotoUpload,
  validate(createEmployeeSchema, 'body'),
  create
);

// PUT /api/employees/:id - Update employee details (Supports JSON or multipart/form-data with photo)
router.put(
  '/:id',
  verifyToken,
  adminOnly,
  employeePhotoUpload,
  validate(employeeIdParamSchema, 'params'),
  validate(updateEmployeeSchema, 'body'),
  update
);

// POST /api/employees/:id/photo - Upload / replace employee photo
router.post(
  '/:id/photo',
  verifyToken,
  adminOnly,
  employeePhotoUpload,
  validate(employeeIdParamSchema, 'params'),
  uploadPhoto
);

// DELETE /api/employees/:id/photo - Delete employee photo
router.delete(
  '/:id/photo',
  verifyToken,
  adminOnly,
  validate(employeeIdParamSchema, 'params'),
  deletePhoto
);

// PATCH /api/employees/:id/status - Update employee employment status
router.patch(
  '/:id/status',
  verifyToken,
  adminOnly,
  validate(employeeIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/employees/:id - Remove employee
router.delete(
  '/:id',
  verifyToken,
  adminOnly,
  validate(employeeIdParamSchema, 'params'),
  deleteEmployee
);

export default router;
