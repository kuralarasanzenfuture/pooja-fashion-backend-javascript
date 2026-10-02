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
  checkNameExists,
} from './role.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { verifyToken, adminOnly, superAdminOnly } from '../../middlewares/auth.middleware.js';
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

// GET /api/roles - List roles with pagination & filtering (Admin and SuperAdmin)
router.get(
  '/',
  verifyToken,
  adminOnly,
  validate(getRolesQuerySchema, 'query'),
  getAll
);

// GET /api/roles/company/:companyId - List all roles for a company (Admin and SuperAdmin)
router.get(
  '/company/:companyId',
  verifyToken,
  adminOnly,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/roles/code/:companyId/:roleCode - Get role by company ID and role code (Admin and SuperAdmin)
router.get(
  '/code/:companyId/:roleCode',
  verifyToken,
  adminOnly,
  validate(roleCodeParamSchema, 'params'),
  getByCode
);

// GET /api/roles/check-name - Check if role name already exists (Admin and SuperAdmin)
router.get(
  '/check-name',
  verifyToken,
  adminOnly,
  checkNameExists
);

// GET /api/roles/:id - Get role by ID (Admin and SuperAdmin)
router.get(
  '/:id',
  verifyToken,
  adminOnly,
  validate(roleIdParamSchema, 'params'),
  getById
);

// POST /api/roles - Create role (Admin can create company roles; SuperAdmin can create system & company roles)
router.post(
  '/',
  verifyToken,
  adminOnly,
  validate(createRoleSchema, 'body'),
  create
);

// PUT /api/roles/:id - Update existing role (Admin for company roles; SuperAdmin for any role)
router.put(
  '/:id',
  verifyToken,
  adminOnly,
  validate(roleIdParamSchema, 'params'),
  validate(updateRoleSchema, 'body'),
  update
);

// PATCH /api/roles/:id/status - Update role active status (Admin for company roles; SuperAdmin for any role)
router.patch(
  '/:id/status',
  verifyToken,
  adminOnly,
  validate(roleIdParamSchema, 'params'),
  validate(updateRoleStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/roles/:id - Delete role (Admin for company roles; SuperAdmin for any company role; system roles protected)
router.delete(
  '/:id',
  verifyToken,
  adminOnly,
  validate(roleIdParamSchema, 'params'),
  deleteRole
);

// POST /api/roles/company/:companyId/seed-defaults - Seed default system roles (SuperAdmin only)
router.post(
  '/company/:companyId/seed-defaults',
  verifyToken,
  superAdminOnly,
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

export default router;
