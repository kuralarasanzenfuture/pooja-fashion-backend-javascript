import * as brandService from './brand.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/brands
 * List brands with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { brands, meta } = await brandService.getBrands(req.query);
    return sendSuccess(res, brands, 'Brands retrieved successfully', 200, meta);
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
    const brand = await brandService.getBrandById(req.params.id);
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
      req.params.brandCode
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
    const brands = await brandService.getBrandsByCompanyId(req.params.companyId, {
      isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
    });
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
      req.brandUploadSlug
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
      req.brandUploadSlug
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
      updatedBy
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
      req.brandUploadSlug
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
    const brand = await brandService.deleteBrandLogo(req.params.id);
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
    const result = await brandService.deleteBrand(req.params.id);
    return sendSuccess(res, result, 'Brand deleted successfully');
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
  uploadLogo,
  deleteLogo,
  deleteBrand,
};
