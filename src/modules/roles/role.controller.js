import * as roleService from './role.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/roles
 * List roles with pagination & filtering.
 * SuperAdmin can view all roles. Admin is scoped to their company and global system roles.
 */
export const getAll = async (req, res, next) => {
  try {
    const { roles, meta } = await roleService.getRoles(req.query, req.user);
    return sendSuccess(res, roles, 'Roles retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/roles/:id
 * Retrieve a single role by ID with scope validation.
 */
export const getById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id, req.user);
    return sendSuccess(res, role, 'Role retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/roles/code/:companyId/:roleCode
 * Retrieve a role by company scope and code.
 */
export const getByCode = async (req, res, next) => {
  try {
    const role = await roleService.getRoleByCode(req.params.companyId, req.params.roleCode, req.user);
    return sendSuccess(res, role, 'Role retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/roles/company/:companyId
 * List all roles for a specific company (includes global system roles).
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const roles = await roleService.getRolesByCompanyId(req.params.companyId, true, req.user);
    return sendSuccess(res, roles, 'Company roles retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/roles
 * Create a new role.
 * SuperAdmin can create global system roles or company roles.
 * Admin can create custom roles for their company.
 */
export const create = async (req, res, next) => {
  try {
    const roleData = { ...req.body };
    // If not a system role and company_id is not specified in body, resolve from logged in user's company
    if (!roleData.is_system_role && (!roleData.company_id || Number(roleData.company_id) <= 0) && req.user?.companyId) {
      roleData.company_id = Number(req.user.companyId);
    }
    const role = await roleService.createRole(roleData, req.user);
    return sendCreated(res, role, 'Role created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/roles/:id
 * Update an existing role.
 */
export const update = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body, req.user);
    return sendSuccess(res, role, 'Role updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/roles/:id/status
 * Update role active status.
 */
export const updateStatus = async (req, res, next) => {
  try {
    const role = await roleService.updateRoleStatus(req.params.id, req.body.is_active, req.user);
    return sendSuccess(res, role, 'Role status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/roles/:id
 * Delete a custom role.
 */
export const deleteRole = async (req, res, next) => {
  try {
    const deleted = await roleService.deleteRole(req.params.id, req.user);
    return sendSuccess(res, deleted, 'Role deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/roles/company/:companyId/seed-defaults
 * Seed default system roles (SuperAdmin only).
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const roles = await roleService.seedDefaultCompanyRoles(req.params.companyId, req.user);
    return sendSuccess(res, roles, 'Default system roles seeded successfully');
  } catch (error) {
    return next(error);
  }
};


/**
 * GET /api/roles/check-name
 * Check whether a role name already exists in the given company or global scope.
 */
export const checkNameExists = async (req, res, next) => {
  try {
    const roleName = req.query.name || req.query.role_name;
    const companyId = req.query.company_id ? Number(req.query.company_id) : null;
    const isSystemRole = req.query.is_system_role === 'true' || req.query.is_system_role === true;
    const excludeId = req.query.exclude_id ? Number(req.query.exclude_id) : null;

    const result = await roleService.checkRoleNameExists({
      roleName,
      companyId,
      isSystemRole,
      excludeId,
      user: req.user,
    });

    return sendSuccess(res, result, result.message);
  } catch (error) {
    return next(error);
  }
};

export default {
  checkNameExists,
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
