import { Router } from 'express';
import {
  createProductTax,
  getProductTaxes,
  getProductTaxById,
  getProductTaxesByProductId,
  resolveTax,
  updateProductTax,
  updateProductTaxStatus,
  setPrimaryProductTax,
  deleteProductTax,
  bulkAssignTax,
} from './productTax.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  productTaxIdParamSchema,
  productIdParamSchema,
  createProductTaxSchema,
  updateProductTaxSchema,
  updateProductTaxStatusSchema,
  resolveTaxQuerySchema,
  bulkAssignTaxSchema,
  getProductTaxesQuerySchema,
} from './productTax.validation.js';

const router = Router();

// POST /api/product-taxes/bulk-assign - Bulk assign a tax to multiple products
router.post(
  '/bulk-assign',
  validate(bulkAssignTaxSchema, 'body'),
  bulkAssignTax
);

// GET /api/product-taxes/resolve - Resolve effective tax for POS checkout (Variant first, fallback to product)
router.get(
  '/resolve',
  validate(resolveTaxQuerySchema, 'query'),
  resolveTax
);

// GET /api/product-taxes/product/:productId - Get all taxes for a product and its variants
router.get(
  '/product/:productId',
  validate(productIdParamSchema, 'params'),
  getProductTaxesByProductId
);

// GET /api/product-taxes - List product taxes with filters & pagination
router.get(
  '/',
  validate(getProductTaxesQuerySchema, 'query'),
  getProductTaxes
);

// GET /api/product-taxes/:id - Get product tax by ID
router.get(
  '/:id',
  validate(productTaxIdParamSchema, 'params'),
  getProductTaxById
);

// POST /api/product-taxes - Create new product tax mapping
router.post(
  '/',
  validate(createProductTaxSchema, 'body'),
  createProductTax
);

// PUT /api/product-taxes/:id - Update product tax mapping
router.put(
  '/:id',
  validate(productTaxIdParamSchema, 'params'),
  validate(updateProductTaxSchema, 'body'),
  updateProductTax
);

// PATCH /api/product-taxes/:id/status - Toggle active status
router.patch(
  '/:id/status',
  validate(productTaxIdParamSchema, 'params'),
  validate(updateProductTaxStatusSchema, 'body'),
  updateProductTaxStatus
);

// POST /api/product-taxes/:id/set-primary - Set as primary tax
router.post(
  '/:id/set-primary',
  validate(productTaxIdParamSchema, 'params'),
  setPrimaryProductTax
);

// DELETE /api/product-taxes/:id - Delete product tax mapping
router.delete(
  '/:id',
  validate(productTaxIdParamSchema, 'params'),
  deleteProductTax
);

export default router;
