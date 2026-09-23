import { Router } from 'express';
import {
  createProductDiscount,
  getProductDiscounts,
  getProductDiscountById,
  getProductDiscountsByProductId,
  resolveDiscount,
  updateProductDiscount,
  updateProductDiscountStatus,
  setPrimaryProductDiscount,
  deleteProductDiscount,
  bulkAssignDiscount,
} from './productDiscount.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  productDiscountIdParamSchema,
  productIdParamSchema,
  createProductDiscountSchema,
  updateProductDiscountSchema,
  updateProductDiscountStatusSchema,
  resolveDiscountQuerySchema,
  bulkAssignDiscountSchema,
  getProductDiscountsQuerySchema,
} from './productDiscount.validation.js';

const router = Router();

// POST /api/product-discounts/bulk-assign - Bulk assign a discount to multiple products
router.post(
  '/bulk-assign',
  validate(bulkAssignDiscountSchema, 'body'),
  bulkAssignDiscount
);

// GET /api/product-discounts/resolve - Resolve effective discount for POS checkout (Variant first, fallback to product)
router.get(
  '/resolve',
  validate(resolveDiscountQuerySchema, 'query'),
  resolveDiscount
);

// GET /api/product-discounts/product/:productId - Get all discounts for a product and its variants
router.get(
  '/product/:productId',
  validate(productIdParamSchema, 'params'),
  getProductDiscountsByProductId
);

// GET /api/product-discounts - List product discounts with filters & pagination
router.get(
  '/',
  validate(getProductDiscountsQuerySchema, 'query'),
  getProductDiscounts
);

// GET /api/product-discounts/:id - Get product discount by ID
router.get(
  '/:id',
  validate(productDiscountIdParamSchema, 'params'),
  getProductDiscountById
);

// POST /api/product-discounts - Create new product discount mapping
router.post(
  '/',
  validate(createProductDiscountSchema, 'body'),
  createProductDiscount
);

// PUT /api/product-discounts/:id - Update product discount mapping
router.put(
  '/:id',
  validate(productDiscountIdParamSchema, 'params'),
  validate(updateProductDiscountSchema, 'body'),
  updateProductDiscount
);

// PATCH /api/product-discounts/:id/status - Toggle active status
router.patch(
  '/:id/status',
  validate(productDiscountIdParamSchema, 'params'),
  validate(updateProductDiscountStatusSchema, 'body'),
  updateProductDiscountStatus
);

// POST /api/product-discounts/:id/set-primary - Set as primary discount
router.post(
  '/:id/set-primary',
  validate(productDiscountIdParamSchema, 'params'),
  setPrimaryProductDiscount
);

// DELETE /api/product-discounts/:id - Delete product discount mapping
router.delete(
  '/:id',
  validate(productDiscountIdParamSchema, 'params'),
  deleteProductDiscount
);

export default router;
