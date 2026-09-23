import * as colorService from './color.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/colors
 * List colors with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { colors, meta } = await colorService.getColors(req.query);
    return sendSuccess(res, colors, 'Colors retrieved successfully', 200, meta);
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
    const color = await colorService.getColorById(req.params.id);
    return sendSuccess(res, color, 'Color retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/colors/code/:companyId/:colorCode
 * Retrieve color by company ID and code
 */
export const getByCode = async (req, res, next) => {
  try {
    const color = await colorService.getColorByCode(
      req.params.companyId,
      req.params.colorCode
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
      }
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
    const color = await colorService.createColor(data);
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
    const color = await colorService.updateColor(req.params.id, data);
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
      updatedBy
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
    const result = await colorService.deleteColor(req.params.id);
    return sendSuccess(res, result, 'Color deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/colors/company/:companyId/seed-defaults
 * Seed standard default colors
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || null;
    const seeded = await colorService.seedDefaultColors(
      req.params.companyId,
      createdBy
    );
    return sendCreated(res, seeded, 'Default colors seeded successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteColor,
  seedDefaults,
};
