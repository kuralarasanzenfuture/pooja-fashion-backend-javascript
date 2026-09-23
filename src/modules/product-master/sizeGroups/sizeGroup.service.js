import * as sizeGroupRepository from './sizeGroup.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toSizeGroupDTO, toSizeGroupListDTO } from './sizeGroup.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate fallback size group code from name if omitted
 */
export const generateSizeGroupCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * Standard default size groups
 */
export const DEFAULT_SIZE_GROUPS = [
  { name: 'Men', code: 'MEN', description: 'Men standard apparel size group (S, M, L, XL, XXL, etc.)' },
  { name: 'Women', code: 'WOMEN', description: 'Women standard apparel size group (XS, S, M, L, XL, etc.)' },
  { name: 'Kids', code: 'KIDS', description: 'Kids standard apparel size group (24, 26, 28, 30, etc.)' },
  { name: 'Infants', code: 'INFANTS', description: 'Infants and toddler sizing (0-3M, 3-6M, 6-12M, etc.)' },
  { name: 'Footwear', code: 'FOOTWEAR', description: 'Standard footwear sizes (UK/India 6, 7, 8, 9, 10, etc.)' },
];

/**
 * List size groups with pagination, filtering, and search
 */
export const getSizeGroups = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
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
 * Get single size group by primary ID
 */
export const getSizeGroupById = async (id) => {
  const sizeGroup = await sizeGroupRepository.findById(id);
  if (!sizeGroup) {
    throw new NotFoundError(`Size group with ID ${id} not found`);
  }
  return toSizeGroupDTO(sizeGroup);
};

/**
 * Get size group by company ID and code
 */
export const getSizeGroupByCode = async (companyId, sizeGroupCode) => {
  const sizeGroup = await sizeGroupRepository.findByCode(companyId, sizeGroupCode);
  if (!sizeGroup) {
    throw new NotFoundError(
      `Size group with code '${sizeGroupCode}' not found for company ${companyId}`
    );
  }
  return toSizeGroupDTO(sizeGroup);
};

/**
 * Get all size groups for a company
 */
export const getSizeGroupsByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await sizeGroupRepository.findByCompanyId(companyId, options);
  return toSizeGroupListDTO(rows);
};

/**
 * Create a new size group
 */
export const createSizeGroup = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (!data.size_group_code) {
    data.size_group_code = generateSizeGroupCode(data.size_group_name);
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

  const created = await sizeGroupRepository.create(data);
  return toSizeGroupDTO(created);
};

/**
 * Update an existing size group
 */
export const updateSizeGroup = async (id, data) => {
  const existing = await sizeGroupRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size group with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);

  if (data.size_group_code) {
    const codeExists = await sizeGroupRepository.existsByCode(
      companyId,
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
      companyId,
      data.size_group_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Size group name '${data.size_group_name}' already exists for this company`
      );
    }
  }

  const updated = await sizeGroupRepository.update(id, data);
  return toSizeGroupDTO(updated);
};

/**
 * Update size group active status
 */
export const updateSizeGroupStatus = async (id, isActive, updatedBy = null) => {
  const existing = await sizeGroupRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size group with ID ${id} not found`);
  }

  const updated = await sizeGroupRepository.updateStatus(id, isActive, updatedBy);
  return toSizeGroupDTO(updated);
};

/**
 * Delete size group by ID
 */
export const deleteSizeGroup = async (id) => {
  const existing = await sizeGroupRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Size group with ID ${id} not found`);
  }

  const sizeCount = await sizeGroupRepository.countSizes(id);
  if (sizeCount > 0) {
    throw new BadRequestError(
      `Cannot delete size group '${existing.size_group_name}' because it contains ${sizeCount} sizes`
    );
  }

  await sizeGroupRepository.deleteById(id);

  return {
    id: Number(id),
    deleted: true,
    message: 'Size group deleted successfully',
  };
};

/**
 * Seed default size groups for a company
 */
export const seedDefaultSizeGroups = async (companyId, createdBy = null) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const seeded = [];
  for (const group of DEFAULT_SIZE_GROUPS) {
    const codeExists = await sizeGroupRepository.existsByCode(companyId, group.code);
    const nameExists = await sizeGroupRepository.existsByName(companyId, group.name);

    if (!codeExists && !nameExists) {
      const created = await sizeGroupRepository.create({
        company_id: companyId,
        size_group_code: group.code,
        size_group_name: group.name,
        description: group.description,
        is_active: true,
        created_by: createdBy,
      });
      seeded.push(toSizeGroupDTO(created));
    }
  }

  return seeded;
};

export default {
  DEFAULT_SIZE_GROUPS,
  getSizeGroups,
  getSizeGroupById,
  getSizeGroupByCode,
  getSizeGroupsByCompanyId,
  createSizeGroup,
  updateSizeGroup,
  updateSizeGroupStatus,
  deleteSizeGroup,
  seedDefaultSizeGroups,
};
