import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';
import * as productTaxService from './productTax.service.js';

/**
 * Creates a new product tax mapping
 */
export const createProductTax = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const productTax = await productTaxService.createProductTax(req.body, userId);
    return sendCreated(res, productTax, 'Product tax mapping created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets product taxes with filters and pagination
 */
export const getProductTaxes = async (req, res, next) => {
  try {
    const { product_taxes, pagination } = await productTaxService.getProductTaxes(req.query);
    return sendSuccess(res, product_taxes, 'Product taxes retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Resolves effective tax for POS checkout (Variant first, fallback to product level)
 */
export const resolveTax = async (req, res, next) => {
  try {
    const { company_id, product_id, variant_id, as_of } = req.query;
    const resolved = await productTaxService.resolveEffectiveTax(
      company_id,
      product_id,
      variant_id,
      as_of
    );
    return sendSuccess(res, resolved, 'Effective tax resolved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets all taxes assigned to a specific product
 */
export const getProductTaxesByProductId = async (req, res, next) => {
  try {
    const taxes = await productTaxService.getProductTaxesByProductId(req.params.productId);
    return sendSuccess(res, taxes, 'Product taxes retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a single product tax by ID
 */
export const getProductTaxById = async (req, res, next) => {
  try {
    const productTax = await productTaxService.getProductTaxById(req.params.id);
    return sendSuccess(res, productTax, 'Product tax retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a product tax mapping
 */
export const updateProductTax = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const productTax = await productTaxService.updateProductTax(req.params.id, req.body, userId);
    return sendSuccess(res, productTax, 'Product tax updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggles active status of a product tax
 */
export const updateProductTaxStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { is_active } = req.body;
    const productTax = await productTaxService.updateProductTaxStatus(req.params.id, is_active, userId);
    return sendSuccess(res, productTax, 'Product tax status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Sets a product tax as primary
 */
export const setPrimaryProductTax = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const productTax = await productTaxService.setPrimaryProductTax(req.params.id, userId);
    return sendSuccess(res, productTax, 'Primary product tax set successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a product tax mapping
 */
export const deleteProductTax = async (req, res, next) => {
  try {
    await productTaxService.deleteProductTax(req.params.id);
    return sendSuccess(res, null, 'Product tax deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk assigns a tax to multiple products
 */
export const bulkAssignTax = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const result = await productTaxService.bulkAssignTax(req.body, userId);
    return sendSuccess(res, result, 'Taxes assigned to products successfully');
  } catch (error) {
    next(error);
  }
};
