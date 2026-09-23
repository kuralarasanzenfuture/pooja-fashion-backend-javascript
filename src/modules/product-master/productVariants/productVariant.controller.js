import * as productVariantService from './productVariant.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/product-variants
 * List product variants with pagination, search, and filters
 */
export const getVariants = async (req, res, next) => {
  try {
    const { variants, pagination } = await productVariantService.getProductVariants(req.query);
    return sendSuccess(res, variants, 'Product variants retrieved successfully', 200, pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-variants/:id
 * Retrieve single product variant by ID
 */
export const getVariantById = async (req, res, next) => {
  try {
    const variant = await productVariantService.getProductVariantById(req.params.id);
    return sendSuccess(res, variant, 'Product variant retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-variants/company/:companyId/sku/:sku
 * Retrieve single product variant by company ID and SKU
 */
export const getVariantBySku = async (req, res, next) => {
  try {
    const variant = await productVariantService.getProductVariantBySku(
      req.params.companyId,
      req.params.sku
    );
    return sendSuccess(res, variant, 'Product variant retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-variants/product/:productId
 * Retrieve all product variants for a given product
 */
export const getVariantsByProductId = async (req, res, next) => {
  try {
    const variants = await productVariantService.getVariantsByProductId(req.params.productId, {
      isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
    });
    return sendSuccess(res, variants, 'Product variants retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-variants
 * Create a new product variant
 */
export const createVariant = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const variant = await productVariantService.createProductVariant(data);
    return sendCreated(res, variant, 'Product variant created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/product-variants/:id
 * Update an existing product variant
 */
export const updateVariant = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const variant = await productVariantService.updateProductVariant(req.params.id, data);
    return sendSuccess(res, variant, 'Product variant updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/product-variants/:id/status
 * Update product variant active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || req.body.updated_by || null;
    const variant = await productVariantService.updateStatus(
      req.params.id,
      req.body.is_active,
      updatedBy
    );
    return sendSuccess(res, variant, 'Product variant status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-variants/:id/set-default
 * Designate a variant as default for its product
 */
export const setDefaultVariant = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const variant = await productVariantService.setDefaultVariant(req.params.id, updatedBy);
    return sendSuccess(res, variant, 'Default product variant set successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/product-variants/:id
 * Delete a product variant by ID
 */
export const deleteVariant = async (req, res, next) => {
  try {
    const result = await productVariantService.deleteProductVariant(req.params.id);
    return sendSuccess(res, result, 'Product variant deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getVariants,
  getVariantById,
  getVariantBySku,
  getVariantsByProductId,
  createVariant,
  updateVariant,
  updateStatus,
  setDefaultVariant,
  deleteVariant,
};
