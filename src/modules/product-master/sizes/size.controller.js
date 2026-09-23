import * as sizeService from './size.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/sizes
 * List sizes with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { sizes, meta } = await sizeService.getSizes(req.query);
    return sendSuccess(res, sizes, 'Sizes retrieved successfully', 200, meta);
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
    const size = await sizeService.getSizeById(req.params.id);
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
      req.params.sizeCode
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
      }
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
      }
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
    const size = await sizeService.createSize(data);
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
    const size = await sizeService.updateSize(req.params.id, data);
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
      updatedBy
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
    const result = await sizeService.deleteSize(req.params.id);
    return sendSuccess(res, result, 'Size deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCode,
  getBySizeGroupId,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteSize,
};
