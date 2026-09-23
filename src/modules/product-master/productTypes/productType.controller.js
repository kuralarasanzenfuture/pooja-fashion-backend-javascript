import * as productTypeService from './productType.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/product-types
 * List product types with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { productTypes, meta } = await productTypeService.getProductTypes(req.query);
    return sendSuccess(res, productTypes, 'Product types retrieved successfully', 200, meta);
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
    const productType = await productTypeService.getProductTypeById(req.params.id);
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
    const productType = await productTypeService.getProductTypeByCode(
      req.params.companyId,
      req.params.typeCode
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
      }
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
    const productType = await productTypeService.createProductType(data);
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
    const productType = await productTypeService.updateProductType(req.params.id, data);
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
      updatedBy
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
    const result = await productTypeService.deleteProductType(req.params.id);
    return sendSuccess(res, result, 'Product type deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-types/company/:companyId/seed-defaults
 * Seed standard default product types
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || null;
    const seeded = await productTypeService.seedDefaultProductTypes(
      req.params.companyId,
      createdBy
    );
    return sendCreated(res, seeded, 'Default product types seeded successfully');
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
  deleteProductType,
  seedDefaults,
};
