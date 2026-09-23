import * as colorRepository from './color.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toColorDTO, toColorListDTO } from './color.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate fallback color code from name if omitted
 */
export const generateColorCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * Standard default colors for apparel retail
 */
export const DEFAULT_COLORS = [
  { color_code: 'BLK', color_name: 'Black', hex_code: '#000000', display_order: 1 },
  { color_code: 'WHT', color_name: 'White', hex_code: '#FFFFFF', display_order: 2 },
  { color_code: 'NVY', color_name: 'Navy Blue', hex_code: '#000080', display_order: 3 },
  { color_code: 'RED', color_name: 'Red', hex_code: '#FF0000', display_order: 4 },
  { color_code: 'RYL', color_name: 'Royal Blue', hex_code: '#4169E1', display_order: 5 },
  { color_code: 'MRN', color_name: 'Maroon', hex_code: '#800000', display_order: 6 },
  { color_code: 'BGE', color_name: 'Beige', hex_code: '#F5F5DC', display_order: 7 },
  { color_code: 'OLV', color_name: 'Olive Green', hex_code: '#808000', display_order: 8 },
  { color_code: 'GRY', color_name: 'Grey', hex_code: '#808080', display_order: 9 },
  { color_code: 'YLW', color_name: 'Yellow', hex_code: '#FFFF00', display_order: 10 },
];

/**
 * List colors with pagination, filtering, and search
 */
export const getColors = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await colorRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    sortBy: sortBy || 'display_order',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    colors: toColorListDTO(rows),
    meta,
  };
};

/**
 * Get single color by primary ID
 */
export const getColorById = async (id) => {
  const color = await colorRepository.findById(id);
  if (!color) {
    throw new NotFoundError(`Color with ID ${id} not found`);
  }
  return toColorDTO(color);
};

/**
 * Get color by company ID and code
 */
export const getColorByCode = async (companyId, colorCode) => {
  const color = await colorRepository.findByCode(companyId, colorCode);
  if (!color) {
    throw new NotFoundError(
      `Color with code '${colorCode}' not found for company ${companyId}`
    );
  }
  return toColorDTO(color);
};

/**
 * Get all colors for a company
 */
export const getColorsByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await colorRepository.findByCompanyId(companyId, options);
  return toColorListDTO(rows);
};

/**
 * Create a new color
 */
export const createColor = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (!data.color_code) {
    data.color_code = generateColorCode(data.color_name);
  }

  const codeExists = await colorRepository.existsByCode(
    data.company_id,
    data.color_code
  );
  if (codeExists) {
    throw new BadRequestError(
      `Color code '${data.color_code}' already exists for this company`
    );
  }

  const nameExists = await colorRepository.existsByName(
    data.company_id,
    data.color_name
  );
  if (nameExists) {
    throw new BadRequestError(
      `Color name '${data.color_name}' already exists for this company`
    );
  }

  const created = await colorRepository.create(data);
  return toColorDTO(created);
};

/**
 * Update an existing color
 */
export const updateColor = async (id, data) => {
  const existing = await colorRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Color with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);

  if (data.color_code) {
    const codeExists = await colorRepository.existsByCode(
      companyId,
      data.color_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Color code '${data.color_code}' already exists for this company`
      );
    }
  }

  if (data.color_name) {
    const nameExists = await colorRepository.existsByName(
      companyId,
      data.color_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Color name '${data.color_name}' already exists for this company`
      );
    }
  }

  const updated = await colorRepository.update(id, data);
  return toColorDTO(updated);
};

/**
 * Update color active status
 */
export const updateColorStatus = async (id, isActive, updatedBy = null) => {
  const existing = await colorRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Color with ID ${id} not found`);
  }

  const updated = await colorRepository.updateStatus(id, isActive, updatedBy);
  return toColorDTO(updated);
};

/**
 * Delete color by ID
 */
export const deleteColor = async (id) => {
  const existing = await colorRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Color with ID ${id} not found`);
  }

  const variantCount = await colorRepository.countVariants(id);
  if (variantCount > 0) {
    throw new BadRequestError(
      `Cannot delete color '${existing.color_name}' because it is assigned to ${variantCount} product variant(s)`
    );
  }

  await colorRepository.deleteById(id);

  return {
    id: Number(id),
    deleted: true,
    message: 'Color deleted successfully',
  };
};

/**
 * Seed default standard colors for a company
 */
export const seedDefaultColors = async (companyId, createdBy = null) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const seeded = [];
  for (const col of DEFAULT_COLORS) {
    const codeExists = await colorRepository.existsByCode(companyId, col.color_code);
    const nameExists = await colorRepository.existsByName(companyId, col.color_name);

    if (!codeExists && !nameExists) {
      const created = await colorRepository.create({
        company_id: companyId,
        color_code: col.color_code,
        color_name: col.color_name,
        hex_code: col.hex_code,
        display_order: col.display_order,
        is_active: true,
        created_by: createdBy,
      });
      seeded.push(toColorDTO(created));
    }
  }

  return seeded;
};

export default {
  DEFAULT_COLORS,
  generateColorCode,
  getColors,
  getColorById,
  getColorByCode,
  getColorsByCompanyId,
  createColor,
  updateColor,
  updateColorStatus,
  deleteColor,
  seedDefaultColors,
};
