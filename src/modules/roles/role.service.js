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

  const { rows, total } = await roleRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    isSystemRole,
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
 * Get role by company ID and role code
 */
export const getRoleByCode = async (companyId, roleCode) => {
  const role = await roleRepository.findByCode(companyId, roleCode);
  if (!role) {
    throw new NotFoundError(`Role '${roleCode}' not found for company ${companyId}`);
  }
  return toRoleDTO(role);
};

/**
 * Get all roles for a specific company
 */
export const getRolesByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await roleRepository.findByCompanyId(companyId);
  return toRoleListDTO(rows);
};

/**
 * Create a new role with automatic meaningful role code generation if omitted
 */
export const createRole = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  // Handle role_code: auto-generate if omitted, validate uniqueness if provided
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

  // Validate unique role_name per company
  const nameExists = await roleRepository.existsByName(data.company_id, data.role_name);
  if (nameExists) {
    throw new BadRequestError(
      `Role name '${data.role_name}' already exists for company ${data.company_id}`
    );
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
      throw new BadRequestError(
        `Role code '${data.role_code}' already exists for company ${existing.company_id}`
      );
    }
  }

  if (data.role_name && data.role_name.toLowerCase() !== existing.role_name.toLowerCase()) {
    const nameExists = await roleRepository.existsByName(existing.company_id, data.role_name, id);
    if (nameExists) {
      throw new BadRequestError(
        `Role name '${data.role_name}' already exists for company ${existing.company_id}`
      );
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
 * Seed default system roles (SUPERADMIN and ADMIN) for a company idempotently
 */
export const seedDefaultCompanyRoles = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const seededRoles = [];
  for (const defaultRole of DEFAULT_SYSTEM_ROLES) {
    const existing = await roleRepository.findByCode(companyId, defaultRole.role_code);
    if (!existing) {
      const created = await roleRepository.create({
        company_id: companyId,
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

export default {
  getRoles,
  getRoleById,
  getRoleByCode,
  getRolesByCompanyId,
  createRole,
  updateRole,
  updateRoleStatus,
  deleteRole,
  seedDefaultCompanyRoles,
};
