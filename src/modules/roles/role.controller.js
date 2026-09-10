import * as roleService from './role.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/roles
 */
export const getAll = async (req, res, next) => {
  try {
    const { roles, meta } = await roleService.getRoles(req.query);
    return sendSuccess(res, roles, 'Roles retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/roles/:id
 */
export const getById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    return sendSuccess(res, role, 'Role retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/roles/code/:companyId/:roleCode
 */
export const getByCode = async (req, res, next) => {
  try {
    const role = await roleService.getRoleByCode(req.params.companyId, req.params.roleCode);
    return sendSuccess(res, role, 'Role retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/roles/company/:companyId
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const roles = await roleService.getRolesByCompanyId(req.params.companyId);
    return sendSuccess(res, roles, 'Company roles retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/roles
 */
export const create = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    return sendCreated(res, role, 'Role created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/roles/:id
 */
export const update = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    return sendSuccess(res, role, 'Role updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/roles/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const role = await roleService.updateRoleStatus(req.params.id, req.body.is_active);
    return sendSuccess(res, role, 'Role status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/roles/:id
 */
export const deleteRole = async (req, res, next) => {
  try {
    const deleted = await roleService.deleteRole(req.params.id);
    return sendSuccess(res, deleted, 'Role deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/roles/company/:companyId/seed-defaults
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const roles = await roleService.seedDefaultCompanyRoles(req.params.companyId);
    return sendSuccess(res, roles, 'Default system roles seeded successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteRole,
  seedDefaults,
};
