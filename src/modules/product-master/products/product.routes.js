import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductByCode,
  createProduct,
  updateProduct,
  updateStatus,
  deleteProduct,
} from './product.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  updateStatusSchema,
  productIdParamSchema,
  productCodeParamSchema,
  getProductsQuerySchema,
} from './product.validation.js';

const router = Router();

// GET /api/product-master/products - List products with pagination, search, and filters
router.get('/', validate(getProductsQuerySchema, 'query'), getProducts);

// GET /api/product-master/products/company/:companyId/code/:productCode - Get by company & code
router.get(
  '/company/:companyId/code/:productCode',
  validate(productCodeParamSchema, 'params'),
  getProductByCode
);

// GET /api/product-master/products/:id - Get product by primary key ID
router.get('/:id', validate(productIdParamSchema, 'params'), getProductById);

// POST /api/product-master/products - Create a new product
router.post('/', validate(createProductSchema, 'body'), createProduct);

// PUT /api/product-master/products/:id - Update product
router.put(
  '/:id',
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema, 'body'),
  updateProduct
);

// PATCH /api/product-master/products/:id/status - Update product status
router.patch(
  '/:id/status',
  validate(productIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/products/:id - Delete product
router.delete('/:id', validate(productIdParamSchema, 'params'), deleteProduct);

export default router;
