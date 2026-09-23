import * as productService from './product.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/products
 * List products with pagination, search, and filters
 */
export const getProducts = async (req, res, next) => {
  try {
    const { products, pagination } = await productService.getProducts(req.query);
    return sendSuccess(res, products, 'Products retrieved successfully', 200, pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/products/:id
 * Retrieve a single product by primary key ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, product, 'Product retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/products/company/:companyId/code/:productCode
 * Retrieve a single product by company ID and code
 */
export const getProductByCode = async (req, res, next) => {
  try {
    const product = await productService.getProductByCode(
      req.params.companyId,
      req.params.productCode
    );
    return sendSuccess(res, product, 'Product retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/products
 * Create a new product
 */
export const createProduct = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const product = await productService.createProduct(data);
    return sendCreated(res, product, 'Product created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/products/:id
 * Update an existing product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const product = await productService.updateProduct(req.params.id, data);
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/products/:id/status
 * Update product active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || req.body.updated_by || null;
    const product = await productService.updateStatus(
      req.params.id,
      req.body.is_active,
      updatedBy
    );
    return sendSuccess(res, product, 'Product status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/products/:id
 * Delete a product by ID
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    return sendSuccess(res, result, 'Product deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getProducts,
  getProductById,
  getProductByCode,
  createProduct,
  updateProduct,
  updateStatus,
  deleteProduct,
};
