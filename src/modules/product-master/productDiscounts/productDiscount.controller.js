import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';
import * as productDiscountService from './productDiscount.service.js';

/**
 * Creates a new product discount mapping
 */
export const createProductDiscount = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const productDiscount = await productDiscountService.createProductDiscount(
      req.body,
      userId
    );
    return sendCreated(res, productDiscount, 'Product discount created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets product discounts with filters and pagination
 */
export const getProductDiscounts = async (req, res, next) => {
  try {
    const { product_discounts, pagination } =
      await productDiscountService.getProductDiscounts(req.query);
    return sendSuccess(
      res,
      product_discounts,
      'Product discounts retrieved successfully',
      200,
      pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a single product discount by ID
 */
export const getProductDiscountById = async (req, res, next) => {
  try {
    const productDiscount = await productDiscountService.getProductDiscountById(
      req.params.id
    );
    return sendSuccess(res, productDiscount, 'Product discount retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets all discounts for a product and its variants
 */
export const getProductDiscountsByProductId = async (req, res, next) => {
  try {
    const discounts = await productDiscountService.getProductDiscountsByProductId(
      req.params.productId
    );
    return sendSuccess(res, discounts, 'Product discounts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Resolves effective discount for POS checkout
 */
export const resolveDiscount = async (req, res, next) => {
  try {
    const resolved = await productDiscountService.resolveEffectiveDiscount(req.query);
    return sendSuccess(res, resolved, 'Effective discount resolved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing product discount mapping
 */
export const updateProductDiscount = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const updated = await productDiscountService.updateProductDiscount(
      req.params.id,
      req.body,
      userId
    );
    return sendSuccess(res, updated, 'Product discount updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggles active status of a product discount mapping
 */
export const updateProductDiscountStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { is_active } = req.body;
    const updated = await productDiscountService.updateProductDiscountStatus(
      req.params.id,
      is_active,
      userId
    );
    return sendSuccess(res, updated, 'Product discount status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Sets a discount mapping as primary
 */
export const setPrimaryProductDiscount = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const updated = await productDiscountService.setPrimaryProductDiscount(
      req.params.id,
      userId
    );
    return sendSuccess(res, updated, 'Primary product discount set successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a product discount record
 */
export const deleteProductDiscount = async (req, res, next) => {
  try {
    await productDiscountService.deleteProductDiscount(req.params.id);
    return sendSuccess(res, null, 'Product discount deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk assigns a discount to multiple products
 */
export const bulkAssignDiscount = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const result = await productDiscountService.bulkAssignDiscount(req.body, userId);
    return sendSuccess(res, result, 'Discounts assigned to products successfully');
  } catch (error) {
    next(error);
  }
};
