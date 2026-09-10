import * as roleRepository from './role.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import { toRoleDTO, toRoleListDTO } from './role.mapper.js';
import { generateRoleCode, DEFAULT_SYSTEM_ROLES } from './role.utils.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List roles with pagination, filtering, and search
 */
export const getRoles = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id ? Number(query.company_id) : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const isSystemRole = query.is_system_role !== undefined ? query.is_system_role : null;
  const includeGlobal = query.include_global !== undefined ? query.include_global : true;

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
 * Get role by primary ID
 */
export const getRoleById = async (id) => {
  const role = await roleRepository.findById(id);
  if (!role) {
    throw new NotFoundError(`Role with ID ${id} not found`);
  }
  return toRoleDTO(role);
};

/**
 * Get role by company ID (or global) and role code
 */
export const getRoleByCode = async (companyId, roleCode) => {
  const targetCompanyId =
    companyId === 'global' || companyId === 'null' || !companyId ? null : Number(companyId);

  const role = await roleRepository.findByCode(targetCompanyId, roleCode);
  if (!role) {
    const scope = targetCompanyId ? `company ${targetCompanyId}` : 'global scope';
    throw new NotFoundError(`Role '${roleCode}' not found for ${scope}`);
  }
  return toRoleDTO(role);
};

/**
 * Get all roles for a specific company (including global system roles)
 */
export const getRolesByCompanyId = async (companyId, includeGlobal = true) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await roleRepository.findByCompanyId(companyId, includeGlobal);
  return toRoleListDTO(rows);
};

/**
 * Create a new role with automatic meaningful role code generation if omitted.
 * Enforces global vs company scope constraints:
 * - is_system_role = true  => global scope (company_id = null)
 * - is_system_role = false => company-specific (company_id is required)
 */
export const createRole = async (data) => {
  const isSystemRole = Boolean(data.is_system_role);

  if (isSystemRole) {
    data.company_id = null;

    if (data.role_code && data.role_code.trim().length > 0) {
      const codeExists = await roleRepository.existsByCode(null, data.role_code);
      if (codeExists) {
        throw new BadRequestError(`Global role code '${data.role_code}' already exists`);
      }
    } else {
      const existingCodes = await roleRepository.findExistingCodesByCompanyId(null);
      data.role_code = generateRoleCode({
        roleName: data.role_name,
        existingCodes,
      });
    }

    const nameExists = await roleRepository.existsByName(null, data.role_name);
    if (nameExists) {
      throw new BadRequestError(`Global role name '${data.role_name}' already exists`);
    }
  } else {
    // Custom role: requires valid company
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
        `Role name '${data.role_name}' already exists for company ${data.company_id}`
      );
    }
  }

  const created = await roleRepository.create(data);
  return toRoleDTO(created);
};

/**
 * Update an existing role with enterprise safeguards for system roles
 */
export const updateRole = async (id, data) => {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Role with ID ${id} not found`);
  }

  // Safeguards for system roles
  if (existing.is_system_role) {
    if (data.role_code && data.role_code.toUpperCase() !== existing.role_code.toUpperCase()) {
      throw new ForbiddenError(`Cannot modify role code for system role '${existing.role_code}'`);
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

  const updated = await roleRepository.update(id, data);
  return toRoleDTO(updated);
};

/**
 * Update role active/inactive status
 */
export const updateRoleStatus = async (id, isActive) => {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Role with ID ${id} not found`);
  }

  if (existing.is_system_role && existing.role_code === 'SUPERADMIN' && isActive === false) {
    throw new ForbiddenError('The default SUPERADMIN system role cannot be deactivated');
  }

  const updated = await roleRepository.updateStatus(id, isActive);
  return toRoleDTO(updated);
};

/**
 * Delete role by primary ID with protection against deleting system roles
 */
export const deleteRole = async (id) => {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Role with ID ${id} not found`);
  }

  if (existing.is_system_role) {
    throw new ForbiddenError(`System role '${existing.role_code}' cannot be deleted`);
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
 * Ensure default system roles (SUPERADMIN and ADMIN) are seeded and available for a company
 */
export const seedDefaultCompanyRoles = async (companyId) => {
  if (companyId) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }
  }
  return seedGlobalSystemRoles();
};

export default {
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
