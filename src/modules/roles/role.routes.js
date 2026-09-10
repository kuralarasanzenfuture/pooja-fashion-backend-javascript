import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteRole,
  seedDefaults,
} from './role.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createRoleSchema,
  updateRoleSchema,
  updateRoleStatusSchema,
  roleIdParamSchema,
  companyIdParamSchema,
  roleCodeParamSchema,
  getRolesQuerySchema,
} from './role.validation.js';

const router = Router();

// GET /api/roles - List roles with pagination & filtering
router.get('/', validate(getRolesQuerySchema, 'query'), getAll);

// GET /api/roles/company/:companyId - List all roles for a company
router.get('/company/:companyId', validate(companyIdParamSchema, 'params'), getByCompanyId);

// GET /api/roles/code/:companyId/:roleCode - Get role by company ID and role code
router.get('/code/:companyId/:roleCode', validate(roleCodeParamSchema, 'params'), getByCode);

// GET /api/roles/:id - Get role by ID
router.get('/:id', validate(roleIdParamSchema, 'params'), getById);

// POST /api/roles - Create role (auto-generates role code if not provided)
router.post('/', validate(createRoleSchema, 'body'), create);

// PUT /api/roles/:id - Update existing role
router.put(
  '/:id',
  validate(roleIdParamSchema, 'params'),
  validate(updateRoleSchema, 'body'),
  update
);

// PATCH /api/roles/:id/status - Update role active status
router.patch(
  '/:id/status',
  validate(roleIdParamSchema, 'params'),
  validate(updateRoleStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/roles/:id - Delete role (system roles protected)
router.delete('/:id', validate(roleIdParamSchema, 'params'), deleteRole);

// POST /api/roles/company/:companyId/seed-defaults - Seed default system roles (SUPERADMIN, ADMIN)
router.post(
  '/company/:companyId/seed-defaults',
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

export default router;
