import * as brandService from './brand.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/brands
 * List brands with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { brands, meta } = await brandService.getBrands(req.query, req.user);
    return sendSuccess(res, brands, 'Brands retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/brands/all
 * List all brands without pagination (for dropdowns / selectors)
 * Scoped to token-based user's company_id
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const brands = await brandService.getAllBrands(req.query, req.user);
    return sendSuccess(res, brands, 'All brands retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/brands/stats
 * Get brand aggregate statistics for token user's company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await brandService.getBrandStats(req.query, req.user);
    return sendSuccess(res, stats, 'Brand statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/brands/reorder
 * Bulk reorder display sequence of brands
 */
export const reorder = async (req, res, next) => {
  try {
    const result = await brandService.reorderBrands(req.body.items, req.user, req);
    return sendSuccess(res, result, 'Brands reordered successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/brands/:id
 * Retrieve single brand by ID
 */
export const getById = async (req, res, next) => {
  try {
    const brand = await brandService.getBrandById(req.params.id, req.user);
    return sendSuccess(res, brand, 'Brand retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/brands/code/:companyId/:brandCode
 * Retrieve brand by company ID and brand code
 */
export const getByCode = async (req, res, next) => {
  try {
    const brand = await brandService.getBrandByCode(
      req.params.companyId,
      req.params.brandCode,
      req.user
    );
    return sendSuccess(res, brand, 'Brand retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/brands/company/:companyId
 * Retrieve all brands for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const brands = await brandService.getBrandsByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
    return sendSuccess(res, brands, 'Company brands retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/brands
 * Create new brand (supports JSON or multipart/form-data with logo)
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const brand = await brandService.createBrand(
      data,
      req.files,
      req.brandUploadSlug,
      req.user,
      req
    );
    return sendCreated(res, brand, 'Brand created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/brands/:id
 * Update existing brand
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const brand = await brandService.updateBrand(
      req.params.id,
      data,
      req.files,
      req.brandUploadSlug,
      req.user,
      req
    );
    return sendSuccess(res, brand, 'Brand updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/brands/:id/status
 * Update brand active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const brand = await brandService.updateBrandStatus(
      req.params.id,
      req.body.is_active,
      updatedBy,
      req.user,
      req
    );
    return sendSuccess(res, brand, 'Brand status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/brands/:id/logo
 * Upload or replace brand logo
 */
export const uploadLogo = async (req, res, next) => {
  try {
    const brand = await brandService.uploadBrandLogo(
      req.params.id,
      req.files,
      req.brandUploadSlug,
      req.user,
      req
    );
    return sendSuccess(res, brand, 'Brand logo uploaded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/brands/:id/logo
 * Remove brand logo
 */
export const deleteLogo = async (req, res, next) => {
  try {
    const brand = await brandService.deleteBrandLogo(req.params.id, req.user, req);
    return sendSuccess(res, brand, 'Brand logo deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/brands/:id
 * Delete brand by ID
 */
export const deleteBrand = async (req, res, next) => {
  try {
    const result = await brandService.deleteBrand(req.params.id, req.user, req);
    return sendSuccess(res, result, 'Brand deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/brands/check-name
 * Check whether a brand name already exists for a company
 */
export const checkBrandName = async (req, res, next) => {
  try {
    const name = req.query.name || req.query.brand_name;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await brandService.checkBrandNameExists({
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
 * GET /api/product-master/brands/check-code
 * Check whether a brand code already exists for a company
 */
export const checkBrandCode = async (req, res, next) => {
  try {
    const code = req.query.code || req.query.brand_code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await brandService.checkBrandCodeExists({
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
  uploadLogo,
  deleteLogo,
  deleteBrand,
  checkBrandName,
  checkBrandCode,
};
