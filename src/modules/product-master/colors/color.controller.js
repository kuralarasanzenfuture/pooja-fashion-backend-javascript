import * as colorService from './color.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/colors
 * List colors with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { colors, meta } = await colorService.getColors(req.query, req.user);
    return sendSuccess(res, colors, 'Colors retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/colors/all
 * List all colors without pagination (for dropdowns / selectors)
 * Scoped to token-based user's company_id
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const colors = await colorService.getAllColors(req.query, req.user);
    return sendSuccess(res, colors, 'All colors retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/colors/stats
 * Get color aggregate statistics for token user's company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await colorService.getColorStats(req.query, req.user);
    return sendSuccess(res, stats, 'Color statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/colors/reorder
 * Bulk reorder display sequence of colors
 */
export const reorder = async (req, res, next) => {
  try {
    const result = await colorService.reorderColors(req.body.items, req.user, req);
    return sendSuccess(res, result, 'Colors reordered successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/colors/:id
 * Retrieve single color by ID
 */
export const getById = async (req, res, next) => {
  try {
    const color = await colorService.getColorById(req.params.id, req.user);
    return sendSuccess(res, color, 'Color retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/colors/code/:companyId/:colorCode
 * Retrieve color by company ID and color code
 */
export const getByCode = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.query.company_id || req.user?.company_id;
    const color = await colorService.getColorByCode(
      companyId,
      req.params.colorCode,
      req.user
    );
    return sendSuccess(res, color, 'Color retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/colors/company/:companyId
 * Retrieve all colors for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const colors = await colorService.getColorsByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
    return sendSuccess(res, colors, 'Company colors retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/colors
 * Create new color
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const color = await colorService.createColor(data, req.user, req);
    return sendCreated(res, color, 'Color created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/colors/:id
 * Update existing color
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const color = await colorService.updateColor(req.params.id, data, req.user, req);
    return sendSuccess(res, color, 'Color updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/colors/:id/status
 * Update color active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const color = await colorService.updateColorStatus(
      req.params.id,
      req.body.is_active,
      updatedBy,
      req.user,
      req
    );
    return sendSuccess(res, color, 'Color status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/colors/:id
 * Delete color by ID
 */
export const deleteColor = async (req, res, next) => {
  try {
    const result = await colorService.deleteColor(req.params.id, req.user, req);
    return sendSuccess(res, result, 'Color deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/colors/seed-defaults
 * Seed standard default colors for a company
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const companyId = req.body.company_id || req.params.companyId;
    const seeded = await colorService.seedDefaultColors(companyId, req.user, req);
    return sendCreated(res, seeded, 'Default colors seeded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/colors/check-name
 * Check whether a color name already exists for a company
 */
export const checkColorName = async (req, res, next) => {
  try {
    const name = req.query.name || req.query.color_name;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await colorService.checkColorNameExists({
      name,
      companyId,
      excludeId,
      user: req.user,
    });

    return sendSuccess(res, result, result.message);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/colors/check-code
 * Check whether a color code already exists for a company
 */
export const checkColorCode = async (req, res, next) => {
  try {
    const code = req.query.code || req.query.color_code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await colorService.checkColorCodeExists({
      code,
      companyId,
      excludeId,
      user: req.user,
    });

    return sendSuccess(res, result, result.message);
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getAllUnpaginated,
  getStats,
  reorder,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteColor,
  seedDefaults,
  checkColorName,
  checkColorCode,
};
