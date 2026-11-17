import * as colorRepository from './color.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toColorDTO, toColorListDTO } from './color.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  generateColorCode,
  formatHexCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  HEX_COLOR_REGEX,
} from './utils/index.js';

export {
  generateColorCode,
  formatHexCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * Standard default colors for apparel & fashion retail (50 realistic records)
 */
export const DEFAULT_COLORS = [
  // 1 - 30: Base Colors
  { color_code: 'BLACK', color_name: 'Black', hex_code: '#000000', display_order: 1, is_active: true, description: 'Classic Black' },
  { color_code: 'WHITE', color_name: 'White', hex_code: '#FFFFFF', display_order: 2, is_active: true, description: 'Classic White' },
  { color_code: 'RED', color_name: 'Red', hex_code: '#FF0000', display_order: 3, is_active: true, description: 'Classic Red' },
  { color_code: 'BLUE', color_name: 'Blue', hex_code: '#0000FF', display_order: 4, is_active: true, description: 'Classic Blue' },
  { color_code: 'NAVY', color_name: 'Navy Blue', hex_code: '#000080', display_order: 5, is_active: true, description: 'Navy Blue' },
  { color_code: 'GREEN', color_name: 'Green', hex_code: '#008000', display_order: 6, is_active: true, description: 'Classic Green' },
  { color_code: 'YELLOW', color_name: 'Yellow', hex_code: '#FFFF00', display_order: 7, is_active: true, description: 'Classic Yellow' },
  { color_code: 'PINK', color_name: 'Pink', hex_code: '#FFC0CB', display_order: 8, is_active: true, description: 'Classic Pink' },
  { color_code: 'ORANGE', color_name: 'Orange', hex_code: '#FFA500', display_order: 9, is_active: true, description: 'Classic Orange' },
  { color_code: 'PURPLE', color_name: 'Purple', hex_code: '#800080', display_order: 10, is_active: true, description: 'Classic Purple' },
  { color_code: 'GREY', color_name: 'Grey', hex_code: '#808080', display_order: 11, is_active: true, description: 'Classic Grey' },
  { color_code: 'BROWN', color_name: 'Brown', hex_code: '#A52A2A', display_order: 12, is_active: true, description: 'Classic Brown' },
  { color_code: 'MAROON', color_name: 'Maroon', hex_code: '#800000', display_order: 13, is_active: true, description: 'Classic Maroon' },
  { color_code: 'BEIGE', color_name: 'Beige', hex_code: '#F5F5DC', display_order: 14, is_active: true, description: 'Classic Beige' },
  { color_code: 'CREAM', color_name: 'Cream', hex_code: '#FFFDD0', display_order: 15, is_active: true, description: 'Classic Cream' },
  { color_code: 'GOLD', color_name: 'Gold', hex_code: '#FFD700', display_order: 16, is_active: true, description: 'Festive Gold' },
  { color_code: 'SILVER', color_name: 'Silver', hex_code: '#C0C0C0', display_order: 17, is_active: true, description: 'Metallic Silver' },
  { color_code: 'SKY-BLUE', color_name: 'Sky Blue', hex_code: '#87CEEB', display_order: 18, is_active: true, description: 'Sky Blue' },
  { color_code: 'LIGHT-BLUE', color_name: 'Light Blue', hex_code: '#ADD8E6', display_order: 19, is_active: true, description: 'Light Blue' },
  { color_code: 'DARK-BLUE', color_name: 'Dark Blue', hex_code: '#00008B', display_order: 20, is_active: true, description: 'Dark Blue' },
  { color_code: 'DARK-GREEN', color_name: 'Dark Green', hex_code: '#006400', display_order: 21, is_active: true, description: 'Dark Green' },
  { color_code: 'OLIVE', color_name: 'Olive Green', hex_code: '#808000', display_order: 22, is_active: true, description: 'Olive Green' },
  { color_code: 'LAVENDER', color_name: 'Lavender', hex_code: '#E6E6FA', display_order: 23, is_active: true, description: 'Lavender' },
  { color_code: 'MAGENTA', color_name: 'Magenta', hex_code: '#FF00FF', display_order: 24, is_active: true, description: 'Magenta' },
  { color_code: 'TURQUOISE', color_name: 'Turquoise', hex_code: '#40E0D0', display_order: 25, is_active: true, description: 'Turquoise' },
  { color_code: 'PEACH', color_name: 'Peach', hex_code: '#FFE5B4', display_order: 26, is_active: true, description: 'Peach' },
  { color_code: 'WINE', color_name: 'Wine', hex_code: '#722F37', display_order: 27, is_active: true, description: 'Wine' },
  { color_code: 'TEAL', color_name: 'Teal', hex_code: '#008080', display_order: 28, is_active: true, description: 'Teal' },
  { color_code: 'CORAL', color_name: 'Coral', hex_code: '#FF7F50', display_order: 29, is_active: true, description: 'Coral' },
  { color_code: 'MUSTARD', color_name: 'Mustard', hex_code: '#FFDB58', display_order: 30, is_active: true, description: 'Mustard' },

  // 31 - 50: Additional Fashion Variations
  { color_code: 'RUST', color_name: 'Rust', hex_code: '#B7410E', display_order: 31, is_active: true, description: 'Rust' },
  { color_code: 'TAN', color_name: 'Tan', hex_code: '#D2B48C', display_order: 32, is_active: true, description: 'Tan' },
  { color_code: 'KHAKI', color_name: 'Khaki', hex_code: '#C3B091', display_order: 33, is_active: true, description: 'Khaki' },
  { color_code: 'COFFEE', color_name: 'Coffee Brown', hex_code: '#6F4E37', display_order: 34, is_active: true, description: 'Coffee Brown' },
  { color_code: 'CHOCOLATE', color_name: 'Chocolate', hex_code: '#7B3F00', display_order: 35, is_active: true, description: 'Chocolate' },
  { color_code: 'CHARCOAL', color_name: 'Charcoal Grey', hex_code: '#36454F', display_order: 36, is_active: true, description: 'Charcoal Grey' },
  { color_code: 'OFF-WHITE', color_name: 'Off White', hex_code: '#FAF9F6', display_order: 37, is_active: true, description: 'Off White' },
  { color_code: 'IVORY', color_name: 'Ivory', hex_code: '#FFFFF0', display_order: 38, is_active: true, description: 'Ivory' },
  { color_code: 'FUCHSIA', color_name: 'Fuchsia', hex_code: '#FF00FF', display_order: 39, is_active: true, description: 'Fuchsia' },
  { color_code: 'ROSE', color_name: 'Rose Pink', hex_code: '#F33A6A', display_order: 40, is_active: true, description: 'Rose Pink' },
  { color_code: 'BABY-PINK', color_name: 'Baby Pink', hex_code: '#F4C2C2', display_order: 41, is_active: true, description: 'Baby Pink' },
  { color_code: 'PEACOCK-BLUE', color_name: 'Peacock Blue', hex_code: '#005F69', display_order: 42, is_active: true, description: 'Peacock Blue' },
  { color_code: 'SEA-GREEN', color_name: 'Sea Green', hex_code: '#2E8B57', display_order: 43, is_active: true, description: 'Sea Green' },
  { color_code: 'MINT-GREEN', color_name: 'Mint Green', hex_code: '#98FF98', display_order: 44, is_active: true, description: 'Mint Green' },
  { color_code: 'LEMON-YELLOW', color_name: 'Lemon Yellow', hex_code: '#FFF44F', display_order: 45, is_active: true, description: 'Lemon Yellow' },
  { color_code: 'SKY-GREY', color_name: 'Sky Grey', hex_code: '#B7C9D6', display_order: 46, is_active: true, description: 'Sky Grey' },
  { color_code: 'BRICK-RED', color_name: 'Brick Red', hex_code: '#CB4154', display_order: 47, is_active: true, description: 'Brick Red' },
  { color_code: 'ONION-PINK', color_name: 'Onion Pink', hex_code: '#C08081', display_order: 48, is_active: true, description: 'Onion Pink' },
  { color_code: 'SANDAL', color_name: 'Sandal', hex_code: '#C2A078', display_order: 49, is_active: true, description: 'Sandal' },
  { color_code: 'MULTICOLOR', color_name: 'Multicolor', hex_code: null, display_order: 50, is_active: true, description: 'Multicolor' },
];

/**
 * List colors with pagination, filtering, search, and company multi-tenancy.
 */
export const getColors = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
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
 * Get all colors for a company without pagination (for dropdowns / selectors)
 * Strictly scopes to token-based user's company_id
 */
export const getAllColors = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'display_order';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await colorRepository.findAllByCompany(companyId, {
    isActive,
    search,
    sortBy,
    sortOrder,
  });

  return toColorListDTO(rows);
};

/**
 * Get color aggregate statistics for a company
 */
export const getColorStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  return colorRepository.getColorStats(companyId);
};

/**
 * Bulk reorder display sequence of colors
 */
export const reorderColors = async (items = [], user = null, requestContext = null) => {
  const companyId = resolveEffectiveCompanyId(user, null);
  const updatedIds = await colorRepository.reorderColors(items, companyId);

  await recordAuditLog({
    action: 'REORDER',
    module: 'colors',
    entityType: 'Color',
    entityId: updatedIds[0] || null,
    entityName: 'Bulk Reorder',
    companyId,
    userId: user?.id,
    description: `Reordered display order for ${updatedIds.length} color(s)`,
    oldData: null,
    newData: { count: updatedIds.length, updatedIds },
    requestContext,
  });

  return {
    updatedCount: updatedIds.length,
    updatedIds,
  };
};

/**
 * Get single color by primary ID with tenant isolation check
 */
export const getColorById = async (id, user = null) => {
  const color = await colorRepository.findById(id);
  if (!color) {
    throw new NotFoundError(`Color with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(color.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view colors for another company');
    }
  }

  return toColorDTO(color);
};

/**
 * Get color by company ID and code
 */
export const getColorByCode = async (companyId, colorCode, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const color = await colorRepository.findByCode(effectiveCompanyId, colorCode);
  if (!color) {
    throw new NotFoundError(
      `Color with code '${colorCode}' not found for company ${effectiveCompanyId}`
    );
  }
  return toColorDTO(color);
};

/**
 * Get all colors for a company
 */
export const getColorsByCompanyId = async (companyId, options = {}, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const rows = await colorRepository.findByCompanyId(effectiveCompanyId, options);
  return toColorListDTO(rows);
};

/**
 * Check whether a color name already exists for a company
 */
export const checkColorNameExists = async ({ name, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check color name');
  }

  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    throw new BadRequestError('Color name is required');
  }

  const exists = await colorRepository.existsByName(effectiveCompanyId, trimmedName, excludeId);
  return {
    exists,
    message: exists
      ? `Color name '${trimmedName}' is already taken`
      : `Color name '${trimmedName}' is available`,
    name: trimmedName,
    companyId: effectiveCompanyId,
  };
};

/**
 * Check whether a color code already exists for a company
 */
export const checkColorCodeExists = async ({ code, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check color code');
  }

  const trimmedCode = String(code || '').trim().toUpperCase();
  if (!trimmedCode) {
    throw new BadRequestError('Color code is required');
  }

  const exists = await colorRepository.existsByCode(effectiveCompanyId, trimmedCode, excludeId);
  return {
    exists,
    message: exists
      ? `Color code '${trimmedCode}' is already taken`
      : `Color code '${trimmedCode}' is available`,
    code: trimmedCode,
    companyId: effectiveCompanyId,
  };
};

/**
 * Create a new color
 */
export const createColor = async (data, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, data.company_id || data.companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to create a color');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  data.company_id = effectiveCompanyId;

  if (!data.color_code || !String(data.color_code).trim()) {
    data.color_code = generateColorCode(data.color_name);
  } else {
    data.color_code = String(data.color_code).trim().toUpperCase();
  }

  if (data.hex_code) {
    data.hex_code = formatHexCode(data.hex_code);
    if (!HEX_COLOR_REGEX.test(data.hex_code)) {
      throw new BadRequestError('Hex code must be a valid 6-character hex color (e.g. #FF0000)');
    }
  } else {
    data.hex_code = null;
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

  if (user?.id) {
    data.created_by = user.id;
  }

  const created = await colorRepository.create(data);
  const dto = toColorDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'colors',
    entityType: 'Color',
    entityId: created.id,
    entityName: created.color_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Color "${created.color_name}" (Code: ${created.color_code}) created`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing color
 */
export const updateColor = async (id, data, user = null, requestContext = null) => {
  const existing = await colorRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Color with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update colors for another company');
    }
  }

  let targetCompanyId = Number(existing.company_id);
  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    if (!canUserSelectCompany(user)) {
      throw new ForbiddenError('You cannot reassign color to another company');
    }
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
    targetCompanyId = Number(data.company_id);
  }

  if (data.color_code) {
    data.color_code = String(data.color_code).trim().toUpperCase();
    const codeExists = await colorRepository.existsByCode(
      targetCompanyId,
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
    data.color_name = String(data.color_name).trim();
    const nameExists = await colorRepository.existsByName(
      targetCompanyId,
      data.color_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Color name '${data.color_name}' already exists for this company`
      );
    }
  }

  if (data.hex_code !== undefined) {
    if (data.hex_code) {
      data.hex_code = formatHexCode(data.hex_code);
      if (!HEX_COLOR_REGEX.test(data.hex_code)) {
        throw new BadRequestError('Hex code must be a valid 6-character hex color (e.g. #FF0000)');
      }
    } else {
      data.hex_code = null;
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
  }

  const updated = await colorRepository.update(id, data);
  const dto = toColorDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'colors',
    entityType: 'Color',
    entityId: updated.id,
    entityName: updated.color_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Color "${updated.color_name}" (Code: ${updated.color_code}) updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update color active status
 */
export const updateColorStatus = async (id, isActive, updatedBy = null, user = null, requestContext = null) => {
  const existing = await colorRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Color with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update color status for another company');
    }
  }

  const finalUpdatedBy = user?.id || updatedBy || null;
  const updated = await colorRepository.updateStatus(id, isActive, finalUpdatedBy);
  const dto = toColorDTO(updated);

  await recordAuditLog({
    action: 'STATUS_CHANGE',
    module: 'colors',
    entityType: 'Color',
    entityId: updated.id,
    entityName: updated.color_name,
    companyId: updated.company_id,
    userId: user?.id || updatedBy,
    description: `Color "${updated.color_name}" status changed to ${isActive ? 'active' : 'inactive'}`,
    oldData: { is_active: existing.is_active },
    newData: { is_active: updated.is_active },
    requestContext,
  });

  return dto;
};

/**
 * Delete color by ID
 */
export const deleteColor = async (id, user = null, requestContext = null) => {
  const existing = await colorRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Color with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete colors for another company');
    }
  }

  const variantCount = await colorRepository.countVariants(id);
  if (variantCount > 0) {
    throw new BadRequestError(
      `Cannot delete color '${existing.color_name}' because it is assigned to ${variantCount} product variant(s)`
    );
  }

  await colorRepository.deleteById(id);

  await recordAuditLog({
    action: 'DELETE',
    module: 'colors',
    entityType: 'Color',
    entityId: Number(id),
    entityName: existing.color_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Color "${existing.color_name}" (Code: ${existing.color_code}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return {
    id: Number(id),
    deleted: true,
    message: 'Color deleted successfully',
  };
};

/**
 * Seed default standard colors for a company
 */
export const seedDefaultColors = async (companyId = null, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to seed default colors');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const seeded = [];
  for (const col of DEFAULT_COLORS) {
    const codeExists = await colorRepository.existsByCode(effectiveCompanyId, col.color_code);
    const nameExists = await colorRepository.existsByName(effectiveCompanyId, col.color_name);

    if (!codeExists && !nameExists) {
      const created = await colorRepository.create({
        company_id: effectiveCompanyId,
        color_code: col.color_code,
        color_name: col.color_name,
        hex_code: col.hex_code,
        description: col.description || null,
        display_order: col.display_order,
        is_active: true,
        created_by: user?.id || null,
      });
      seeded.push(toColorDTO(created));
    }
  }

  await recordAuditLog({
    action: 'SEED',
    module: 'colors',
    entityType: 'Color',
    entityId: effectiveCompanyId,
    entityName: `Default Colors (${company.company_name})`,
    companyId: effectiveCompanyId,
    userId: user?.id,
    description: `Seeded ${seeded.length} standard default colors for company ${company.company_name}`,
    oldData: null,
    newData: { count: seeded.length },
    requestContext,
  });

  return seeded;
};

export default {
  DEFAULT_COLORS,
  generateColorCode,
  formatHexCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  getColors,
  getAllColors,
  getColorStats,
  reorderColors,
  getColorById,
  getColorByCode,
  getColorsByCompanyId,
  checkColorNameExists,
  checkColorCodeExists,
  createColor,
  updateColor,
  updateColorStatus,
  deleteColor,
  seedDefaultColors,
};
