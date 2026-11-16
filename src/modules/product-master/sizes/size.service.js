import * as sizeRepository from './size.repository.js';
import * as sizeGroupRepository from '../sizeGroups/sizeGroup.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toSizeDTO, toSizeListDTO } from './size.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  generateSizeCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  generateSizeCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * Standard default sizes by group code (Realistic Pooja Fashion data)
 */
export const DEFAULT_SIZES_BY_GROUP = {
  MEN: [
    { size_code: 'S', size_name: 'Small', display_order: 1 },
    { size_code: 'M', size_name: 'Medium', display_order: 2 },
    { size_code: 'L', size_name: 'Large', display_order: 3 },
    { size_code: 'XL', size_name: 'Extra Large', display_order: 4 },
    { size_code: 'XXL', size_name: 'Double XL', display_order: 5 },
    { size_code: '3XL', size_name: 'Triple XL', display_order: 6 },
  ],
  WOMEN: [
    { size_code: 'XS', size_name: 'Extra Small', display_order: 1 },
    { size_code: 'S', size_name: 'Small', display_order: 2 },
    { size_code: 'M', size_name: 'Medium', display_order: 3 },
    { size_code: 'L', size_name: 'Large', display_order: 4 },
    { size_code: 'XL', size_name: 'Extra Large', display_order: 5 },
    { size_code: 'XXL', size_name: 'Double XL', display_order: 6 },
  ],
  KIDS: [
    { size_code: '20', size_name: 'Size 20', display_order: 1 },
    { size_code: '22', size_name: 'Size 22', display_order: 2 },
    { size_code: '24', size_name: 'Size 24', display_order: 3 },
    { size_code: '26', size_name: 'Size 26', display_order: 4 },
    { size_code: '28', size_name: 'Size 28', display_order: 5 },
    { size_code: '30', size_name: 'Size 30', display_order: 6 },
  ],
  FOOTWEAR: [
    { size_code: '6', size_name: 'UK 6', display_order: 1 },
    { size_code: '7', size_name: 'UK 7', display_order: 2 },
    { size_code: '8', size_name: 'UK 8', display_order: 3 },
    { size_code: '9', size_name: 'UK 9', display_order: 4 },
    { size_code: '10', size_name: 'UK 10', display_order: 5 },
  ],
  FREE: [
    { size_code: 'FREE', size_name: 'Free Size', display_order: 1 },
  ],
  SAREE: [
    { size_code: 'FREE', size_name: 'Free Size', display_order: 1 },
  ],
  INNERWEAR: [
    { size_code: 'M', size_name: 'Medium', display_order: 1 },
    { size_code: 'L', size_name: 'Large', display_order: 2 },
    { size_code: 'XL', size_name: 'Extra Large', display_order: 3 },
  ],
};

/**
 * List sizes with pagination, search, and filtering.
 * Enforces company multi-tenancy:
 * - SuperAdmin can view all sizes across companies, or filter by company_id.
 * - Non-SuperAdmin users are strictly scoped to their assigned company.
 */
export const getSizes = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const sizeGroupId = query.size_group_id || query.sizeGroupId ? Number(query.size_group_id || query.sizeGroupId) : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await sizeRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    sizeGroupId,
    isActive,
    sortBy: sortBy || 'display_order',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    sizes: toSizeListDTO(rows),
    meta,
  };
};

/**
 * Get all sizes for a company without pagination (for dropdowns / selectors)
 * Strictly scopes to token-based user's company_id
 */
export const getAllSizes = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const sizeGroupId = query.size_group_id || query.sizeGroupId ? Number(query.size_group_id || query.sizeGroupId) : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'display_order';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await sizeRepository.findAllByCompany(companyId, {
    sizeGroupId,
    isActive,
    search,
    sortBy,
    sortOrder,
  });

  return toSizeListDTO(rows);
};

/**
 * Get size aggregate statistics for user's company
 */
export const getSizeStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const sizeGroupId = query.size_group_id || query.sizeGroupId ? Number(query.size_group_id || query.sizeGroupId) : null;
  return sizeRepository.getSizeStats(companyId, sizeGroupId);
};

/**
 * Reorder sizes in bulk
 */
export const reorderSizes = async (items = [], user = null, requestContext = null) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Items array is required for reordering');
  }

  const effectiveCompanyId = resolveEffectiveCompanyId(user);
  const updatedIds = await sizeRepository.reorderSizes(items, effectiveCompanyId);

  await recordAuditLog({
    action: 'REORDER',
    module: 'sizes',
    entityType: 'Size',
    entityId: updatedIds[0] || null,
    entityName: 'Sizes Reorder',
    companyId: effectiveCompanyId,
    userId: user?.id,
    description: `Reordered ${updatedIds.length} sizes`,
    oldData: null,
    newData: { ids: updatedIds },
    requestContext,
  });

  return {
    success: true,
    message: `Successfully reordered ${updatedIds.length} sizes`,
    updatedCount: updatedIds.length,
    updatedIds,
  };
};

/**
 * Get single size by primary ID with tenant isolation verification
 */
export const getSizeById = async (id, user = null) => {
  const size = await sizeRepository.findById(id);
  if (!size) {
    throw new NotFoundError(`Size with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(size.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view sizes for another company');
    }
  }

  return toSizeDTO(size);
};

/**
 * Get size by size group ID and size code with tenant isolation verification
 */
export const getSizeByCode = async (sizeGroupId, sizeCode, user = null) => {
  const sizeGroup = await sizeGroupRepository.findById(sizeGroupId);
  if (!sizeGroup) {
    throw new NotFoundError(`Size group with ID ${sizeGroupId} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(sizeGroup.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view sizes for another company');
    }
  }

  const size = await sizeRepository.findByCode(sizeGroupId, sizeCode);
  if (!size) {
    throw new NotFoundError(
      `Size with code '${sizeCode}' not found for size group ${sizeGroupId}`
    );
  }
  return toSizeDTO(size);
};

/**
 * Get all sizes for a size group with tenant isolation verification
 */
export const getSizesBySizeGroupId = async (sizeGroupId, options = {}, user = null) => {
  const sizeGroup = await sizeGroupRepository.findById(sizeGroupId);
  if (!sizeGroup) {
    throw new NotFoundError(`Size group with ID ${sizeGroupId} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(sizeGroup.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view sizes for another company');
    }
  }

  const rows = await sizeRepository.findBySizeGroupId(sizeGroupId, options);
  return toSizeListDTO(rows);
};

/**
 * Get all sizes for a company with tenant isolation verification
 */
export const getSizesByCompanyId = async (companyId, options = {}, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view sizes for another company');
    }
  }

  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await sizeRepository.findByCompanyId(companyId, options);
  return toSizeListDTO(rows);
};

/**
 * Create a new size with company derived from parent size group:
 * - Automatically derives and enforces company_id from parent size_group.
 * - Non-SuperAdmin users can only create sizes under size groups belonging to their company.
 */
export const createSize = async (data, user = null, requestContext = null) => {
  if (!data.size_group_id) {
    throw new BadRequestError('Size Group ID is required to create a size');
  }

  data.size_group_id = Number(data.size_group_id);

  // Retrieve parent size group to automatically derive its company_id
  const sizeGroup = await sizeGroupRepository.findById(data.size_group_id);
  if (!sizeGroup) {
    throw new NotFoundError(`Size group with ID ${data.size_group_id} not found`);
  }

  const derivedCompanyId = Number(sizeGroup.company_id);

  // If user is restricted to a company, ensure the parent size group belongs to user's company
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && derivedCompanyId !== Number(userCompId)) {
      throw new ForbiddenError(
        'You do not have permission to create sizes for another company'
      );
    }
  }

  // If client also supplied company_id, ensure it does not conflict with parent size group
  if (data.company_id && Number(data.company_id) !== derivedCompanyId) {
    throw new BadRequestError(
      `Provided company_id (${data.company_id}) does not match parent size group company (${derivedCompanyId})`
    );
  }

  data.company_id = derivedCompanyId;

  if (!data.size_code || !data.size_code.trim()) {
    data.size_code = generateSizeCode(data.size_name);
  } else {
    data.size_code = data.size_code.trim().toUpperCase();
  }

  const codeExists = await sizeRepository.existsByCode(
    data.size_group_id,
    data.size_code
  );
  if (codeExists) {
    throw new BadRequestError(
      `Size code '${data.size_code}' already exists in this size group`
    );
  }

  const nameExists = await sizeRepository.existsByName(
    data.size_group_id,
    data.size_name
  );
  if (nameExists) {
    throw new BadRequestError(
      `Size name '${data.size_name}' already exists in this size group`
    );
  }

  if (user?.id) {
    data.created_by = user.id;
  }

  const created = await sizeRepository.create(data);
  const dto = toSizeDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'sizes',
    entityType: 'Size',
    entityId: created.id,
    entityName: created.size_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Size "${created.size_name}" (Code: ${created.size_code}) created under size group ID ${created.size_group_id}`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing size with company derived from parent size group
 */
export const updateSize = async (id, data, user = null, requestContext = null) => {
  const existing = await sizeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update sizes for another company');
    }
  }

  let targetGroupId = Number(existing.size_group_id);
  let targetCompanyId = Number(existing.company_id);

  if (data.size_group_id && Number(data.size_group_id) !== Number(existing.size_group_id)) {
    const newGroup = await sizeGroupRepository.findById(data.size_group_id);
    if (!newGroup) {
      throw new NotFoundError(`Size group with ID ${data.size_group_id} not found`);
    }

    targetGroupId = Number(newGroup.id);
    targetCompanyId = Number(newGroup.company_id);

    if (!canUserSelectCompany(user) && user) {
      const userCompId = user.companyId || user.company_id;
      if (userCompId && targetCompanyId !== Number(userCompId)) {
        throw new ForbiddenError('You do not have permission to move sizes to another company');
      }
    }
  } else if (data.company_id && Number(data.company_id) !== targetCompanyId) {
    throw new BadRequestError(
      `Cannot change company directly. Size company is derived from its parent size group (${targetCompanyId})`
    );
  }

  data.size_group_id = targetGroupId;
  data.company_id = targetCompanyId;

  if (data.size_code) {
    data.size_code = data.size_code.trim().toUpperCase();
    const codeExists = await sizeRepository.existsByCode(
      targetGroupId,
      data.size_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Size code '${data.size_code}' already exists in this size group`
      );
    }
  }

  if (data.size_name) {
    const nameExists = await sizeRepository.existsByName(
      targetGroupId,
      data.size_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Size name '${data.size_name}' already exists in this size group`
      );
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
  }

  const updated = await sizeRepository.update(id, data);
  const dto = toSizeDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'sizes',
    entityType: 'Size',
    entityId: updated.id,
    entityName: updated.size_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Size "${updated.size_name}" updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update size active status with tenant isolation and audit logging
 */
export const updateSizeStatus = async (
  id,
  isActive,
  updatedBy = null,
  user = null,
  requestContext = null
) => {
  const existing = await sizeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify sizes for another company');
    }
  }

  const updated = await sizeRepository.updateStatus(id, isActive, updatedBy || user?.id);
  const dto = toSizeDTO(updated);

  await recordAuditLog({
    action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    module: 'sizes',
    entityType: 'Size',
    entityId: updated.id,
    entityName: updated.size_name,
    companyId: updated.company_id,
    userId: updatedBy || user?.id,
    description: `Size "${updated.size_name}" ${isActive ? 'activated' : 'deactivated'}`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Delete size by ID with tenant isolation and audit logging
 */
export const deleteSize = async (id, user = null, requestContext = null) => {
  const existing = await sizeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete sizes for another company');
    }
  }

  const variantCount = await sizeRepository.countVariants(id);
  if (variantCount > 0) {
    throw new BadRequestError(
      `Cannot delete size '${existing.size_name}' because it is assigned to ${variantCount} product variant(s)`
    );
  }

  await sizeRepository.deleteById(id);

  await recordAuditLog({
    action: 'DELETE',
    module: 'sizes',
    entityType: 'Size',
    entityId: existing.id,
    entityName: existing.size_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Size "${existing.size_name}" (ID: ${id}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return {
    id: Number(id),
    deleted: true,
    message: 'Size deleted successfully',
  };
};

/**
 * Seed default sizes for a size group
 */
export const seedDefaultSizes = async (
  companyId,
  sizeGroupId,
  user = null,
  requestContext = null
) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const sizeGroup = await sizeGroupRepository.findById(sizeGroupId);
  if (!sizeGroup) {
    throw new NotFoundError(`Size group with ID ${sizeGroupId} not found`);
  }

  if (effectiveCompanyId && Number(sizeGroup.company_id) !== Number(effectiveCompanyId)) {
    throw new ForbiddenError('You do not have permission to seed sizes for another company');
  }

  const groupCode = String(sizeGroup.size_group_code || '').toUpperCase();
  const templateSizes = DEFAULT_SIZES_BY_GROUP[groupCode] || [];

  if (templateSizes.length === 0) {
    throw new BadRequestError(
      `No preset standard sizes available for group code '${groupCode}'. Presets available for: ${Object.keys(
        DEFAULT_SIZES_BY_GROUP
      ).join(', ')}`
    );
  }

  const seeded = [];
  for (const s of templateSizes) {
    const codeExists = await sizeRepository.existsByCode(sizeGroupId, s.size_code);
    const nameExists = await sizeRepository.existsByName(sizeGroupId, s.size_name);

    if (!codeExists && !nameExists) {
      const created = await sizeRepository.create({
        company_id: sizeGroup.company_id,
        size_group_id: sizeGroupId,
        size_code: s.size_code,
        size_name: s.size_name,
        display_order: s.display_order,
        is_active: true,
        created_by: user?.id || null,
      });
      seeded.push(toSizeDTO(created));
    }
  }

  if (seeded.length > 0) {
    await recordAuditLog({
      action: 'SEED',
      module: 'sizes',
      entityType: 'Size',
      entityId: seeded[0].id,
      entityName: 'Default Sizes Seeding',
      companyId: sizeGroup.company_id,
      userId: user?.id,
      description: `Seeded ${seeded.length} default sizes for size group "${sizeGroup.size_group_name}"`,
      oldData: null,
      newData: { count: seeded.length, codes: seeded.map((s) => s.sizeCode) },
      requestContext,
    });
  }

  return seeded;
};

/**
 * Check whether a size name already exists in a size group (or company scope)
 */
export const checkSizeNameExists = async ({
  sizeName,
  sizeGroupId = null,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const name = (sizeName || '').trim();
  if (!name) {
    throw new BadRequestError('Size name is required');
  }

  let targetGroupId = sizeGroupId ? Number(sizeGroupId) : null;
  let targetCompanyId = resolveEffectiveCompanyId(user, companyId);
  let exists = false;
  let message = '';

  if (targetGroupId) {
    const group = await sizeGroupRepository.findById(targetGroupId);
    if (!group) {
      throw new NotFoundError(`Size group with ID ${targetGroupId} not found`);
    }

    if (!canUserSelectCompany(user) && user) {
      const userCompId = user.companyId || user.company_id;
      if (userCompId && Number(group.company_id) !== Number(userCompId)) {
        throw new ForbiddenError('You do not have permission to check sizes for another company');
      }
    }

    exists = await sizeRepository.existsByName(
      targetGroupId,
      name,
      excludeId ? Number(excludeId) : null
    );

    message = exists
      ? `Size name '${name}' already exists in this size group`
      : 'Size name is available in this size group';
  } else if (targetCompanyId) {
    exists = await sizeRepository.existsByNameInCompany(
      targetCompanyId,
      name,
      excludeId ? Number(excludeId) : null
    );

    message = exists
      ? `Size name '${name}' already exists for this company`
      : 'Size name is available for this company';
  } else {
    throw new BadRequestError('Either size_group_id or company_id is required to check size name');
  }

  return {
    exists,
    sizeName: name,
    sizeGroupId: targetGroupId,
    companyId: targetCompanyId,
    message,
  };
};

/**
 * Check whether a size code already exists for a size group
 */
export const checkSizeCodeExists = async ({
  sizeCode,
  sizeGroupId = null,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const code = (sizeCode || '').trim().toUpperCase();
  if (!code) {
    throw new BadRequestError('Size code is required');
  }

  if (!sizeGroupId) {
    throw new BadRequestError('Size group ID is required to check size code');
  }

  const group = await sizeGroupRepository.findById(sizeGroupId);
  if (!group) {
    throw new NotFoundError(`Size group with ID ${sizeGroupId} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(group.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to check sizes for another company');
    }
  }

  const exists = await sizeRepository.existsByCode(
    sizeGroupId,
    code,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    sizeCode: code,
    sizeGroupId: Number(sizeGroupId),
    message: exists
      ? `Size code '${code}' already exists in this size group`
      : 'Size code is available in this size group',
  };
};

export default {
  DEFAULT_SIZES_BY_GROUP,
  generateSizeCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  getSizes,
  getAllSizes,
  getSizeStats,
  reorderSizes,
  getSizeById,
  getSizeByCode,
  getSizesBySizeGroupId,
  getSizesByCompanyId,
  createSize,
  updateSize,
  updateSizeStatus,
  deleteSize,
  seedDefaultSizes,
  checkSizeNameExists,
  checkSizeCodeExists,
};
