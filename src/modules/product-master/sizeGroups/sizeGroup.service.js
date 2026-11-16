import * as sizeGroupRepository from './sizeGroup.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toSizeGroupDTO, toSizeGroupListDTO } from './sizeGroup.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  generateSizeGroupCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  generateSizeGroupCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * Standard default size groups (Realistic Pooja Fashion data)
 */
export const DEFAULT_SIZE_GROUPS = [
  { name: 'Men', code: 'MEN', description: "Standard clothing and apparel sizing for men (Shirts, T-shirts, Trousers, Kurtas, etc.)" },
  { name: 'Women', code: 'WOMEN', description: "Standard clothing and apparel sizing for women (Dresses, Tops, Kurtis, Bottoms, etc.)" },
  { name: 'Kids', code: 'KIDS', description: 'Numbered clothing and apparel sizing for kids and teenagers' },
  { name: 'Infants', code: 'INFANTS', description: 'Infants and toddler sizing (0-3M, 3-6M, 6-12M, etc.)' },
  { name: 'Footwear', code: 'FOOTWEAR', description: 'Standard footwear and shoe sizing (UK/India standard)' },
  { name: 'Free Size', code: 'FREE', description: 'One-size-fits-all / Free size garments (Dupattas, Shawls, Accessories)' },
  { name: 'Saree', code: 'SAREE', description: 'Standard saree dimensions and sizing' },
  { name: 'Innerwear', code: 'INNERWEAR', description: 'Innerwear, lingerie, and loungewear sizing' },
];

/**
 * List size groups with pagination, filtering, and search.
 * Enforces company multi-tenancy:
 * - SuperAdmin can view all size groups across companies, or filter by company_id.
 * - Non-SuperAdmin users are strictly scoped to their assigned company.
 */
export const getSizeGroups = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await sizeGroupRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    sortBy: sortBy || 'size_group_name',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    sizeGroups: toSizeGroupListDTO(rows),
    meta,
  };
};

/**
 * Get all size groups for a company without pagination (for dropdowns / selectors)
 * Strictly scopes to token-based user's company_id
 */
export const getAllSizeGroups = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'size_group_name';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await sizeGroupRepository.findAllByCompany(companyId, {
    isActive,
    search,
    sortBy,
    sortOrder,
  });

  return toSizeGroupListDTO(rows);
};

/**
 * Get size groups tree with nested child sizes for user's company
 */
export const getSizeGroupTree = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const rows = await sizeGroupRepository.findTreeByCompany(companyId, { isActive });
  return rows.map((row) => ({
    ...toSizeGroupDTO(row),
    sizesCount: Number(row.sizes_count || 0),
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
  }));
};

/**
 * Get size group aggregate statistics for user's company
 */
export const getSizeGroupStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  return sizeGroupRepository.getSizeGroupStats(companyId);
};

/**
 * Get single size group by primary ID with tenant isolation verification
 */
export const getSizeGroupById = async (id, user = null) => {
  const sizeGroup = await sizeGroupRepository.findById(id);
  if (!sizeGroup) {
    throw new NotFoundError(`Size group with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(sizeGroup.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view size groups for another company');
    }
  }

  return toSizeGroupDTO(sizeGroup);
};

/**
 * Get size group by company ID and code with tenant isolation verification
 */
export const getSizeGroupByCode = async (companyId, sizeGroupCode, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view size groups for another company');
    }
  }

  const sizeGroup = await sizeGroupRepository.findByCode(companyId, sizeGroupCode);
  if (!sizeGroup) {
    throw new NotFoundError(
      `Size group with code '${sizeGroupCode}' not found for company ${companyId}`
    );
  }
  return toSizeGroupDTO(sizeGroup);
};

/**
 * Get all size groups for a company with tenant isolation verification
 */
export const getSizeGroupsByCompanyId = async (companyId, options = {}, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view size groups for another company');
    }
  }

  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await sizeGroupRepository.findByCompanyId(companyId, options);
  return toSizeGroupListDTO(rows);
};

/**
 * Create a new size group with multi-tenancy and audit logging
 */
export const createSizeGroup = async (data, user = null, requestContext = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      if (data.company_id && Number(data.company_id) !== Number(userCompId)) {
        throw new ForbiddenError('You do not have permission to create size groups for another company');
      }
      data.company_id = Number(userCompId);
    }
  }

  if (!data.company_id) {
    if (user?.companyId || user?.company_id) {
      data.company_id = Number(user.companyId || user.company_id);
    } else {
      throw new BadRequestError('Company ID is required to create a size group');
    }
  }

  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (!data.size_group_code || !data.size_group_code.trim()) {
    data.size_group_code = generateSizeGroupCode(data.size_group_name);
  } else {
    data.size_group_code = data.size_group_code.trim().toUpperCase();
  }

  const codeExists = await sizeGroupRepository.existsByCode(
    data.company_id,
    data.size_group_code
  );
  if (codeExists) {
    throw new BadRequestError(
      `Size group code '${data.size_group_code}' already exists for this company`
    );
  }

  const nameExists = await sizeGroupRepository.existsByName(
    data.company_id,
    data.size_group_name
  );
  if (nameExists) {
    throw new BadRequestError(
      `Size group name '${data.size_group_name}' already exists for this company`
    );
  }

  if (user?.id) {
    data.created_by = user.id;
  }

  const created = await sizeGroupRepository.create(data);
  const dto = toSizeGroupDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'size_groups',
    entityType: 'SizeGroup',
    entityId: created.id,
    entityName: created.size_group_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Size group "${created.size_group_name}" (Code: ${created.size_group_code}) created`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing size group with multi-tenancy and audit logging
 */
export const updateSizeGroup = async (id, data, user = null, requestContext = null) => {
  const existing = await sizeGroupRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size group with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update size groups for another company');
    }
  }

  let targetCompanyId = Number(existing.company_id);

  if (data.company_id && Number(data.company_id) !== targetCompanyId) {
    if (!canUserSelectCompany(user) && user) {
      throw new ForbiddenError('You do not have permission to move size groups to another company');
    }
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
    targetCompanyId = Number(data.company_id);
  }

  if (data.size_group_code) {
    data.size_group_code = data.size_group_code.trim().toUpperCase();
    const codeExists = await sizeGroupRepository.existsByCode(
      targetCompanyId,
      data.size_group_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Size group code '${data.size_group_code}' already exists for this company`
      );
    }
  }

  if (data.size_group_name) {
    const nameExists = await sizeGroupRepository.existsByName(
      targetCompanyId,
      data.size_group_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Size group name '${data.size_group_name}' already exists for this company`
      );
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
  }

  const updated = await sizeGroupRepository.update(id, data);
  const dto = toSizeGroupDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'size_groups',
    entityType: 'SizeGroup',
    entityId: updated.id,
    entityName: updated.size_group_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Size group "${updated.size_group_name}" updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update size group active status with tenant isolation and audit logging
 */
export const updateSizeGroupStatus = async (
  id,
  isActive,
  updatedBy = null,
  user = null,
  requestContext = null
) => {
  const existing = await sizeGroupRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size group with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify size groups for another company');
    }
  }

  const updated = await sizeGroupRepository.updateStatus(id, isActive, updatedBy || user?.id);
  const dto = toSizeGroupDTO(updated);

  await recordAuditLog({
    action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    module: 'size_groups',
    entityType: 'SizeGroup',
    entityId: updated.id,
    entityName: updated.size_group_name,
    companyId: updated.company_id,
    userId: updatedBy || user?.id,
    description: `Size group "${updated.size_group_name}" ${isActive ? 'activated' : 'deactivated'}`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Delete size group by ID with tenant isolation and audit logging
 */
export const deleteSizeGroup = async (id, user = null, requestContext = null) => {
  const existing = await sizeGroupRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size group with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete size groups for another company');
    }
  }

  const sizeCount = await sizeGroupRepository.countSizes(id);
  if (sizeCount > 0) {
    throw new BadRequestError(
      `Cannot delete size group '${existing.size_group_name}' because it contains ${sizeCount} sizes`
    );
  }

  await sizeGroupRepository.deleteById(id);

  await recordAuditLog({
    action: 'DELETE',
    module: 'size_groups',
    entityType: 'SizeGroup',
    entityId: existing.id,
    entityName: existing.size_group_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Size group "${existing.size_group_name}" (ID: ${id}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return {
    id: Number(id),
    deleted: true,
    message: 'Size group deleted successfully',
  };
};

/**
 * Seed default size groups for a company
 */
export const seedDefaultSizeGroups = async (companyId, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to seed default size groups');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const seeded = [];
  for (const group of DEFAULT_SIZE_GROUPS) {
    const codeExists = await sizeGroupRepository.existsByCode(effectiveCompanyId, group.code);
    const nameExists = await sizeGroupRepository.existsByName(effectiveCompanyId, group.name);

    if (!codeExists && !nameExists) {
      const created = await sizeGroupRepository.create({
        company_id: effectiveCompanyId,
        size_group_code: group.code,
        size_group_name: group.name,
        description: group.description,
        is_active: true,
        created_by: user?.id || null,
      });
      seeded.push(toSizeGroupDTO(created));
    }
  }

  if (seeded.length > 0) {
    await recordAuditLog({
      action: 'SEED',
      module: 'size_groups',
      entityType: 'SizeGroup',
      entityId: seeded[0].id,
      entityName: 'Default Size Groups Seeding',
      companyId: effectiveCompanyId,
      userId: user?.id,
      description: `Seeded ${seeded.length} default size groups for company ID ${effectiveCompanyId}`,
      oldData: null,
      newData: { count: seeded.length, codes: seeded.map((s) => s.sizeGroupCode) },
      requestContext,
    });
  }

  return seeded;
};

/**
 * Check whether a size group name already exists for a company
 */
export const checkSizeGroupNameExists = async ({
  name,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    throw new BadRequestError('Size group name is required');
  }

  const targetCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!targetCompanyId) {
    throw new BadRequestError('Company ID is required to check size group name');
  }

  const exists = await sizeGroupRepository.existsByName(
    targetCompanyId,
    trimmedName,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    sizeGroupName: trimmedName,
    companyId: targetCompanyId,
    message: exists
      ? `Size group name '${trimmedName}' already exists for this company`
      : 'Size group name is available',
  };
};

/**
 * Check whether a size group code already exists for a company
 */
export const checkSizeGroupCodeExists = async ({
  code,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const trimmedCode = (code || '').trim().toUpperCase();
  if (!trimmedCode) {
    throw new BadRequestError('Size group code is required');
  }

  const targetCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!targetCompanyId) {
    throw new BadRequestError('Company ID is required to check size group code');
  }

  const exists = await sizeGroupRepository.existsByCode(
    targetCompanyId,
    trimmedCode,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    sizeGroupCode: trimmedCode,
    companyId: targetCompanyId,
    message: exists
      ? `Size group code '${trimmedCode}' already exists for this company`
      : 'Size group code is available',
  };
};

export default {
  DEFAULT_SIZE_GROUPS,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  getSizeGroups,
  getAllSizeGroups,
  getSizeGroupTree,
  getSizeGroupStats,
  getSizeGroupById,
  getSizeGroupByCode,
  getSizeGroupsByCompanyId,
  createSizeGroup,
  updateSizeGroup,
  updateSizeGroupStatus,
  deleteSizeGroup,
  seedDefaultSizeGroups,
  checkSizeGroupNameExists,
  checkSizeGroupCodeExists,
};
