import * as productTypeService from './productType.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/product-types
 * List product types with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { productTypes, meta } = await productTypeService.getProductTypes(req.query, req.user);
    return sendSuccess(res, productTypes, 'Product types retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-types/all
 * List all product types without pagination (for dropdowns / selectors)
 * Scoped to token-based user's company_id
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const productTypes = await productTypeService.getAllProductTypes(req.query, req.user);
    return sendSuccess(res, productTypes, 'All product types retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-types/stats
 * Get product type aggregate statistics for token user's company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await productTypeService.getProductTypeStats(req.query, req.user);
    return sendSuccess(res, stats, 'Product type statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-types/:id
 * Retrieve single product type by ID
 */
export const getById = async (req, res, next) => {
  try {
    const productType = await productTypeService.getProductTypeById(req.params.id, req.user);
    return sendSuccess(res, productType, 'Product type retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-types/code/:companyId/:typeCode
 * Retrieve product type by company ID and code
 */
export const getByCode = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.query.company_id || req.user?.company_id;
    const productType = await productTypeService.getProductTypeByCode(
      companyId,
      req.params.typeCode,
      req.user
    );
    return sendSuccess(res, productType, 'Product type retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-types/company/:companyId
 * Retrieve all product types for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const productTypes = await productTypeService.getProductTypesByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
    return sendSuccess(res, productTypes, 'Company product types retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-types
 * Create new product type
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const productType = await productTypeService.createProductType(data, req.user, req);
    return sendCreated(res, productType, 'Product type created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/product-types/:id
 * Update existing product type
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const productType = await productTypeService.updateProductType(req.params.id, data, req.user, req);
    return sendSuccess(res, productType, 'Product type updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/product-types/:id/status
 * Update product type active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const productType = await productTypeService.updateProductTypeStatus(
      req.params.id,
      req.body.is_active,
      updatedBy,
      req.user,
      req
    );
    return sendSuccess(res, productType, 'Product type status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/product-types/:id
 * Delete product type by ID
 */
export const deleteProductType = async (req, res, next) => {
  try {
    const result = await productTypeService.deleteProductType(req.params.id, req.user, req);
    return sendSuccess(res, result, 'Product type deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-types/seed-defaults
 * Seed standard default product types for a company
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const companyId = req.body.company_id || req.params.companyId;
    const seeded = await productTypeService.seedDefaultProductTypes(companyId, req.user, req);
    return sendCreated(res, seeded, 'Default product types seeded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-types/check-name
 * Check whether a product type name already exists for a company
 */
export const checkProductTypeName = async (req, res, next) => {
  try {
    const name = req.query.name || req.query.type_name;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await productTypeService.checkProductTypeNameExists({
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
 * GET /api/product-master/product-types/check-code
 * Check whether a product type code already exists for a company
 */
export const checkProductTypeCode = async (req, res, next) => {
  try {
    const code = req.query.code || req.query.type_code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await productTypeService.checkProductTypeCodeExists({
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
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteProductType,
  seedDefaults,
  checkProductTypeName,
  checkProductTypeCode,
};
