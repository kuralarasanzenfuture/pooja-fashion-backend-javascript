import * as roleRepository from './role.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import { toRoleDTO, toRoleListDTO } from './role.mapper.js';
import { generateRoleCode, DEFAULT_SYSTEM_ROLES } from './role.utils.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List roles with pagination, filtering, and search.
 * SuperAdmin can view all roles across the platform.
 * Tenant Admin is scoped to their company's roles and global system roles.
 */
export const getRoles = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  
  // Scope enforcement for Admin vs SuperAdmin
  let companyId = query.company_id ? Number(query.company_id) : null;
  let includeGlobal = query.include_global !== undefined 
    ? (query.include_global === true || query.include_global === 'true' || query.include_global === 1 || query.include_global === '1')
    : true;

  if (user && user.roleCode !== 'SUPERADMIN') {
    if (user.companyId) {
      companyId = Number(user.companyId);
      includeGlobal = true;
    }
  } else {
    // For SuperAdmin: if a specific company is selected in the dropdown, only show that company's custom roles unless include_global is explicitly requested
    if (companyId && query.include_global === undefined) {
      includeGlobal = false;
    }
  }

  // Safely parse isActive boolean from boolean or string
  let isActive = null;
  if (query.is_active !== undefined && query.is_active !== null && query.is_active !== '') {
    isActive = query.is_active === true || query.is_active === 'true' || query.is_active === 1 || query.is_active === '1';
  }

  // Safely parse isSystemRole boolean from boolean or string
  let isSystemRole = null;
  if (query.is_system_role !== undefined && query.is_system_role !== null && query.is_system_role !== '') {
    isSystemRole = query.is_system_role === true || query.is_system_role === 'true' || query.is_system_role === 1 || query.is_system_role === '1';
  }

  const { rows, total } = await roleRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    isSystemRole,
    includeGlobal,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    roles: toRoleListDTO(rows),
    meta,
  };
};

/**
 * Get role by primary ID with tenant isolation verification.
 */
export const getRoleById = async (id, user = null) => {
  const role = await roleRepository.findById(id);
  if (!role) {
    throw new NotFoundError(`Role with ID ${id} not found`);
  }

  // Tenant Admin can view global system roles or their company's roles
  if (user && user.roleCode !== 'SUPERADMIN') {
    if (!role.is_system_role && user.companyId && role.company_id && Number(role.company_id) !== Number(user.companyId)) {
      throw new ForbiddenError('You do not have permission to view roles belonging to another company');
    }
  }

  return toRoleDTO(role);
};

/**
 * Get role by company ID (or global) and role code.
 */
export const getRoleByCode = async (companyId, roleCode, user = null) => {
  const targetCompanyId =
    companyId === 'global' || companyId === 'null' || !companyId ? null : Number(companyId);

  if (user && user.roleCode !== 'SUPERADMIN') {
    if (user.companyId && targetCompanyId && Number(targetCompanyId) !== Number(user.companyId)) {
      throw new ForbiddenError('You do not have permission to view roles for another company');
    }
  }

  const role = await roleRepository.findByCode(targetCompanyId, roleCode);
  if (!role) {
    const scope = targetCompanyId ? `company ${targetCompanyId}` : 'global scope';
    throw new NotFoundError(`Role '${roleCode}' not found for ${scope}`);
  }
  return toRoleDTO(role);
};

/**
 * Get all roles for a specific company (including global system roles).
 */
export const getRolesByCompanyId = async (companyId, includeGlobal = true, user = null) => {
  if (user && user.roleCode !== 'SUPERADMIN') {
    if (user.companyId && Number(companyId) !== Number(user.companyId)) {
      throw new ForbiddenError('You do not have permission to view roles for another company');
    }
  }

  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await roleRepository.findByCompanyId(companyId, includeGlobal);
  return toRoleListDTO(rows);
};

/**
 * Create a new role with role authorization safeguards:
 * - SuperAdmin: can create global system roles (is_system_role = true, company_id = null)
 *               or roles for any company.
 * - Admin: can ONLY create company-specific custom roles for their own company.
 */
export const createRole = async (data, user = null) => {
  // Strict Enterprise Rule:
  // Only SUPERADMIN and ADMIN exist as core system roles.
  // New system roles CANNOT be created.
  if (data.is_system_role === true) {
    throw new BadRequestError(
      'New system roles cannot be created. Only SUPERADMIN and ADMIN exist as core system roles.'
    );
  }

  const roleCodeUpper = (data.role_code || '').toUpperCase().trim();
  const roleNameUpper = (data.role_name || '').toUpperCase().trim();

  if (['SUPERADMIN', 'ADMIN'].includes(roleCodeUpper)) {
    throw new BadRequestError(`Cannot create role with reserved system role code '${data.role_code}'`);
  }

  if (['SUPERADMIN', 'ADMIN', 'SUPER ADMIN'].includes(roleNameUpper)) {
    throw new BadRequestError(`Cannot create role with reserved system role name '${data.role_name}'`);
  }

  // All created roles are strictly company custom roles
  data.is_system_role = false;

  const isPlatformAdmin = user && (user.roleCode === 'SUPERADMIN' || user.roleCode === 'ADMIN');

  if (!isPlatformAdmin) {
    // Non-admin users: automatically bind to their own company
    if (user?.companyId) {
      data.company_id = Number(user.companyId);
    }
  } else {
    // Admin / SuperAdmin: use provided company_id, or fallback to user.companyId if not specified
    if (!data.company_id && user?.companyId) {
      data.company_id = Number(user.companyId);
    }
  }

  if (!data.company_id) {
    throw new BadRequestError('Company ID is required for company-specific custom roles');
  }

  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (data.role_code && data.role_code.trim().length > 0) {
    const codeExists = await roleRepository.existsByCode(data.company_id, data.role_code);
    if (codeExists) {
      throw new BadRequestError(
        `Role code '${data.role_code}' already exists for company ${data.company_id}`
      );
    }
  } else {
    const existingCodes = await roleRepository.findExistingCodesByCompanyId(data.company_id);
    data.role_code = generateRoleCode({
      roleName: data.role_name,
      existingCodes,
    });
  }

  const nameExists = await roleRepository.existsByName(data.company_id, data.role_name);
  if (nameExists) {
    throw new BadRequestError(
      `Role name '${data.role_name}' already exists for this company`
    );
  }

  // Audit trail fields
  if (user?.id) {
    data.created_by = user.id;
    data.updated_by = user.id;
  }

  const created = await roleRepository.create(data);
  return toRoleDTO(created);
};

/**
 * Update an existing role with enterprise safeguards:
 * - SuperAdmin can update any role (system role codes protected).
 * - Admin can only update custom roles belonging to their company.
 */
export const updateRole = async (id, data, user = null) => {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Role with ID ${id} not found`);
  }

  // Safeguards for system roles: Protected and locked from edits
  if (existing.is_system_role || ['SUPERADMIN', 'ADMIN'].includes(existing.role_code)) {
    throw new ForbiddenError(`System role '${existing.role_name || existing.role_code}' is protected and cannot be modified`);
  }

  if (data.is_system_role === true) {
    throw new BadRequestError('Roles cannot be promoted to system roles. Only SUPERADMIN and ADMIN exist as core system roles.');
  }

  if (data.role_code && ['SUPERADMIN', 'ADMIN'].includes(data.role_code.toUpperCase().trim())) {
    throw new BadRequestError(`Cannot use reserved system role code '${data.role_code}'`);
  }

  if (data.role_name && ['SUPERADMIN', 'ADMIN', 'SUPER ADMIN'].includes(data.role_name.toUpperCase().trim())) {
    throw new BadRequestError(`Cannot use reserved system role name '${data.role_name}'`);
  }

  // Permissions validation
  if (user && user.roleCode !== 'SUPERADMIN') {
    if (user.companyId && existing.company_id && Number(existing.company_id) !== Number(user.companyId)) {
      throw new ForbiddenError('You do not have permission to modify roles belonging to another company');
    }
  }

  if (data.role_code && data.role_code.toUpperCase() !== existing.role_code.toUpperCase()) {
    const codeExists = await roleRepository.existsByCode(existing.company_id, data.role_code, id);
    if (codeExists) {
      throw new BadRequestError(`Role code '${data.role_code}' already exists in this scope`);
    }
  }

  if (data.role_name && data.role_name.toLowerCase() !== existing.role_name.toLowerCase()) {
    const nameExists = await roleRepository.existsByName(existing.company_id, data.role_name, id);
    if (nameExists) {
      throw new BadRequestError(`Role name '${data.role_name}' already exists in this scope`);
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
  }

  const updated = await roleRepository.update(id, data);
  return toRoleDTO(updated);
};

/**
 * Update role active/inactive status:
 * - SuperAdmin can update status for any role (except SUPERADMIN itself).
 * - Admin can only update status for their company's roles.
 */
export const updateRoleStatus = async (id, isActive, user = null) => {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Role with ID ${id} not found`);
  }

  // Safeguards for system roles: Protected and locked from deactivation
  if (existing.is_system_role || ['SUPERADMIN', 'ADMIN'].includes(existing.role_code)) {
    throw new ForbiddenError(`System role '${existing.role_name || existing.role_code}' is protected and cannot be deactivated or changed`);
  }

  if (user && user.roleCode !== 'SUPERADMIN') {
    if (user.companyId && existing.company_id && Number(existing.company_id) !== Number(user.companyId)) {
      throw new ForbiddenError('You do not have permission to update roles belonging to another company');
    }
  }

  const updated = await roleRepository.updateStatus(id, isActive);

  // If role is deactivated, all users assigned to this role automatically go to inactive
  if (Boolean(isActive) === false) {
    await roleRepository.deactivateUsersByRoleId(id, user?.id || null);
  }

  return toRoleDTO(updated);
};

/**
 * Delete role by primary ID with protection against deleting system roles:
 * - SuperAdmin can delete any company custom role.
 * - Admin can only delete custom roles for their own company.
 * - System roles can NEVER be deleted.
 */
export const deleteRole = async (id, user = null) => {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Role with ID ${id} not found`);
  }

  if (existing.is_system_role || ['SUPERADMIN', 'ADMIN'].includes(existing.role_code)) {
    throw new ForbiddenError(`System role '${existing.role_name || existing.role_code}' is protected and cannot be deleted`);
  }

  if (user && user.roleCode !== 'SUPERADMIN') {
    if (user.companyId && existing.company_id && Number(existing.company_id) !== Number(user.companyId)) {
      throw new ForbiddenError('You do not have permission to delete roles belonging to another company');
    }
  }

  const deleted = await roleRepository.deleteRole(id);
  return toRoleDTO(deleted);
};

/**
 * Seed global system roles (SUPERADMIN and ADMIN) idempotently.
 * Complies with chk_roles_system_scope (is_system_role = true, company_id = null).
 */
export const seedGlobalSystemRoles = async () => {
  const seededRoles = [];
  for (const defaultRole of DEFAULT_SYSTEM_ROLES) {
    const existing = await roleRepository.findByCode(null, defaultRole.role_code);
    if (!existing) {
      const created = await roleRepository.create({
        company_id: null,
        role_code: defaultRole.role_code,
        role_name: defaultRole.role_name,
        description: defaultRole.description,
        is_system_role: true,
        is_active: true,
      });
      seededRoles.push(toRoleDTO(created));
    } else {
      seededRoles.push(toRoleDTO(existing));
    }
  }
  return seededRoles;
};

/**
 * Ensure default system roles (SUPERADMIN and ADMIN) are seeded and available for a company.
 */
export const seedDefaultCompanyRoles = async (companyId, user = null) => {
  if (user && user.roleCode !== 'SUPERADMIN') {
    if (user.companyId && Number(companyId) !== Number(user.companyId)) {
      throw new ForbiddenError('You do not have permission to seed default roles for another company');
    }
  }

  if (companyId) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }
  }
  return seedGlobalSystemRoles();
};


/**
 * Check if a role name already exists within a company or global system scope.
 */
export const checkRoleNameExists = async ({ roleName, companyId, isSystemRole, excludeId, user = null }) => {
  if (!roleName || !roleName.trim()) {
    return { exists: false, message: 'Role name is required' };
  }

  const trimmedName = roleName.trim();
  const upper = trimmedName.toUpperCase();
  if (['SUPERADMIN', 'ADMIN', 'SUPER ADMIN'].includes(upper)) {
    return {
      exists: true,
      roleName: trimmedName,
      message: `'${trimmedName}' is a reserved system role name and cannot be created`,
    };
  }
  const isSystem = Boolean(isSystemRole);
  let targetCompanyId = null;

  if (!isSystem) {
    if (companyId) {
      targetCompanyId = Number(companyId);
    } else if (user?.companyId) {
      targetCompanyId = Number(user.companyId);
    }
  }

  const exists = await roleRepository.existsByName(
    targetCompanyId,
    trimmedName,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    roleName: trimmedName,
    message: exists
      ? `Role name '${trimmedName}' already exists${targetCompanyId ? ' for this company' : ' globally'}`
      : 'Role name is available',
  };
};

export default { checkRoleNameExists, 
  getRoles,
  getRoleById,
  getRoleByCode,
  getRolesByCompanyId,
  createRole,
  updateRole,
  updateRoleStatus,
  deleteRole,
  seedGlobalSystemRoles,
  seedDefaultCompanyRoles,
};
