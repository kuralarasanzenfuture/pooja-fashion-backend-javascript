import * as sizeService from './size.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/sizes
 * List sizes with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { sizes, meta } = await sizeService.getSizes(req.query, req.user);
    return sendSuccess(res, sizes, 'Sizes retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/sizes/all
 * List all sizes without pagination (for dropdowns / selectors)
 * Scoped to token-based user's company_id
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const sizes = await sizeService.getAllSizes(req.query, req.user);
    return sendSuccess(res, sizes, 'All sizes retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/sizes/stats
 * Get size aggregate statistics for token user's company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await sizeService.getSizeStats(req.query, req.user);
    return sendSuccess(res, stats, 'Size statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/sizes/reorder
 * Bulk reorder display sequence of sizes
 */
export const reorder = async (req, res, next) => {
  try {
    const result = await sizeService.reorderSizes(req.body.items, req.user, req);
    return sendSuccess(res, result, 'Sizes reordered successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/sizes/:id
 * Retrieve single size by ID
 */
export const getById = async (req, res, next) => {
  try {
    const size = await sizeService.getSizeById(req.params.id, req.user);
    return sendSuccess(res, size, 'Size retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/sizes/code/:sizeGroupId/:sizeCode
 * Retrieve size by size group ID and size code
 */
export const getByCode = async (req, res, next) => {
  try {
    const size = await sizeService.getSizeByCode(
      req.params.sizeGroupId,
      req.params.sizeCode,
      req.user
    );
    return sendSuccess(res, size, 'Size retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/sizes/size-group/:sizeGroupId
 * Retrieve all sizes for a size group
 */
export const getBySizeGroupId = async (req, res, next) => {
  try {
    const sizes = await sizeService.getSizesBySizeGroupId(
      req.params.sizeGroupId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
    return sendSuccess(res, sizes, 'Size group sizes retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/sizes/company/:companyId
 * Retrieve all sizes for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const sizes = await sizeService.getSizesByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
    return sendSuccess(res, sizes, 'Company sizes retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/sizes
 * Create new size
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const size = await sizeService.createSize(data, req.user, req);
    return sendCreated(res, size, 'Size created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/sizes/:id
 * Update existing size
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const size = await sizeService.updateSize(req.params.id, data, req.user, req);
    return sendSuccess(res, size, 'Size updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/sizes/:id/status
 * Update size active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const size = await sizeService.updateSizeStatus(
      req.params.id,
      req.body.is_active,
      updatedBy,
      req.user,
      req
    );
    return sendSuccess(res, size, 'Size status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/sizes/:id
 * Delete size by ID
 */
export const deleteSize = async (req, res, next) => {
  try {
    const result = await sizeService.deleteSize(req.params.id, req.user, req);
    return sendSuccess(res, result, 'Size deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/sizes/seed-defaults
 * Seed standard default sizes for a size group
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const companyId = req.body.company_id || req.params.companyId;
    const sizeGroupId = req.body.size_group_id || req.params.sizeGroupId;
    const seeded = await sizeService.seedDefaultSizes(companyId, sizeGroupId, req.user, req);
    return sendCreated(res, seeded, 'Default sizes seeded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/sizes/check-name
 * Check whether a size name already exists in a size group or company
 */
export const checkSizeName = async (req, res, next) => {
  try {
    const sizeName = req.query.name || req.query.size_name;
    const sizeGroupId = req.query.size_group_id || req.query.sizeGroupId;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await sizeService.checkSizeNameExists({
      sizeName,
      sizeGroupId,
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
 * GET /api/product-master/sizes/check-code
 * Check whether a size code already exists for a size group
 */
export const checkSizeCode = async (req, res, next) => {
  try {
    const sizeCode = req.query.code || req.query.size_code;
    const sizeGroupId = req.query.size_group_id || req.query.sizeGroupId;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await sizeService.checkSizeCodeExists({
      sizeCode,
      sizeGroupId,
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
  getBySizeGroupId,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteSize,
  seedDefaults,
  checkSizeName,
  checkSizeCode,
};
