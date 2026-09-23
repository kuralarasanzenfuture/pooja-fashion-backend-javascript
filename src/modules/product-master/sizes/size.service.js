import * as sizeRepository from './size.repository.js';
import * as sizeGroupRepository from '../sizeGroups/sizeGroup.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toSizeDTO, toSizeListDTO } from './size.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate fallback size code from size name if omitted
 */
export const generateSizeCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * Standard default sizes by group code
 */
export const DEFAULT_SIZES_BY_GROUP = {
  MEN: [
    { size_code: 'S', size_name: 'Small', display_order: 1 },
    { size_code: 'M', size_name: 'Medium', display_order: 2 },
    { size_code: 'L', size_name: 'Large', display_order: 3 },
    { size_code: 'XL', size_name: 'Extra Large', display_order: 4 },
    { size_code: 'XXL', size_name: 'Double Extra Large', display_order: 5 },
    { size_code: '3XL', size_name: 'Triple Extra Large', display_order: 6 },
  ],
  WOMEN: [
    { size_code: 'XS', size_name: 'Extra Small', display_order: 1 },
    { size_code: 'S', size_name: 'Small', display_order: 2 },
    { size_code: 'M', size_name: 'Medium', display_order: 3 },
    { size_code: 'L', size_name: 'Large', display_order: 4 },
    { size_code: 'XL', size_name: 'Extra Large', display_order: 5 },
    { size_code: 'XXL', size_name: 'Double Extra Large', display_order: 6 },
  ],
  KIDS: [
    { size_code: '24', size_name: 'Size 24', display_order: 1 },
    { size_code: '26', size_name: 'Size 26', display_order: 2 },
    { size_code: '28', size_name: 'Size 28', display_order: 3 },
    { size_code: '30', size_name: 'Size 30', display_order: 4 },
    { size_code: '32', size_name: 'Size 32', display_order: 5 },
  ],
  FOOTWEAR: [
    { size_code: 'UK-6', size_name: 'UK 6 / Euro 40', display_order: 1 },
    { size_code: 'UK-7', size_name: 'UK 7 / Euro 41', display_order: 2 },
    { size_code: 'UK-8', size_name: 'UK 8 / Euro 42', display_order: 3 },
    { size_code: 'UK-9', size_name: 'UK 9 / Euro 43', display_order: 4 },
    { size_code: 'UK-10', size_name: 'UK 10 / Euro 44', display_order: 5 },
  ],
};

/**
 * List sizes with pagination, search, and filtering
 */
export const getSizes = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const sizeGroupId = query.size_group_id || query.sizeGroupId || null;
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
 * Get single size by primary ID
 */
export const getSizeById = async (id) => {
  const size = await sizeRepository.findById(id);
  if (!size) {
    throw new NotFoundError(`Size with ID ${id} not found`);
  }
  return toSizeDTO(size);
};

/**
 * Get size by size group ID and size code
 */
export const getSizeByCode = async (sizeGroupId, sizeCode) => {
  const size = await sizeRepository.findByCode(sizeGroupId, sizeCode);
  if (!size) {
    throw new NotFoundError(
      `Size with code '${sizeCode}' not found for size group ${sizeGroupId}`
    );
  }
  return toSizeDTO(size);
};

/**
 * Get all sizes for a size group
 */
export const getSizesBySizeGroupId = async (sizeGroupId, options = {}) => {
  const sizeGroup = await sizeGroupRepository.findById(sizeGroupId);
  if (!sizeGroup) {
    throw new NotFoundError(`Size group with ID ${sizeGroupId} not found`);
  }

  const rows = await sizeRepository.findBySizeGroupId(sizeGroupId, options);
  return toSizeListDTO(rows);
};

/**
 * Get all sizes for a company
 */
export const getSizesByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await sizeRepository.findByCompanyId(companyId, options);
  return toSizeListDTO(rows);
};

/**
 * Create a new size
 */
export const createSize = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  const sizeGroup = await sizeGroupRepository.findById(data.size_group_id);
  if (!sizeGroup) {
    throw new NotFoundError(`Size group with ID ${data.size_group_id} not found`);
  }

  if (Number(sizeGroup.company_id) !== Number(data.company_id)) {
    throw new BadRequestError(
      `Size group ${data.size_group_id} does not belong to company ${data.company_id}`
    );
  }

  if (!data.size_code) {
    data.size_code = generateSizeCode(data.size_name);
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

  const created = await sizeRepository.create(data);
  return toSizeDTO(created);
};

/**
 * Update an existing size
 */
export const updateSize = async (id, data) => {
  const existing = await sizeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size with ID ${id} not found`);
  }

  const targetCompanyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);
  const targetGroupId = data.size_group_id ? Number(data.size_group_id) : Number(existing.size_group_id);

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  if (data.size_group_id || data.company_id) {
    const targetGroup = await sizeGroupRepository.findById(targetGroupId);
    if (!targetGroup) {
      throw new NotFoundError(`Size group with ID ${targetGroupId} not found`);
    }
    if (Number(targetGroup.company_id) !== targetCompanyId) {
      throw new BadRequestError(
        `Size group ${targetGroupId} does not belong to company ${targetCompanyId}`
      );
    }
  }

  if (data.size_code) {
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

  const updated = await sizeRepository.update(id, data);
  return toSizeDTO(updated);
};

/**
 * Update size active status
 */
export const updateSizeStatus = async (id, isActive, updatedBy = null) => {
  const existing = await sizeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size with ID ${id} not found`);
  }

  const updated = await sizeRepository.updateStatus(id, isActive, updatedBy);
  return toSizeDTO(updated);
};

/**
 * Delete size by ID
 */
export const deleteSize = async (id) => {
  const existing = await sizeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size with ID ${id} not found`);
  }

  const variantCount = await sizeRepository.countVariants(id);
  if (variantCount > 0) {
    throw new BadRequestError(
      `Cannot delete size '${existing.size_name}' because it is assigned to ${variantCount} product variant(s)`
    );
  }

  await sizeRepository.deleteById(id);

  return {
    id: Number(id),
    deleted: true,
    message: 'Size deleted successfully',
  };
};

export default {
  DEFAULT_SIZES_BY_GROUP,
  generateSizeCode,
  getSizes,
  getSizeById,
  getSizeByCode,
  getSizesBySizeGroupId,
  getSizesByCompanyId,
  createSize,
  updateSize,
  updateSizeStatus,
  deleteSize,
};
