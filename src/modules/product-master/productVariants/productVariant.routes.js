import { Router } from 'express';
import {
  getVariants,
  getVariantById,
  getVariantBySku,
  getVariantsByProductId,
  createVariant,
  updateVariant,
  updateStatus,
  setDefaultVariant,
  deleteVariant,
} from './productVariant.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createProductVariantSchema,
  updateProductVariantSchema,
  updateStatusSchema,
  variantIdParamSchema,
  productIdParamSchema,
  skuParamSchema,
  getProductVariantsQuerySchema,
} from './productVariant.validation.js';

const router = Router();

// GET /api/product-master/product-variants - List variants with pagination & filters
router.get('/', validate(getProductVariantsQuerySchema, 'query'), getVariants);

// GET /api/product-master/product-variants/product/:productId - Get all variants for a product
router.get('/product/:productId', validate(productIdParamSchema, 'params'), getVariantsByProductId);

// GET /api/product-master/product-variants/company/:companyId/sku/:sku - Get by company & SKU
router.get(
  '/company/:companyId/sku/:sku',
  validate(skuParamSchema, 'params'),
  getVariantBySku
);

// GET /api/product-master/product-variants/:id - Get variant by primary key ID
router.get('/:id', validate(variantIdParamSchema, 'params'), getVariantById);

// POST /api/product-master/product-variants - Create a new product variant
router.post('/', validate(createProductVariantSchema, 'body'), createVariant);

// PUT /api/product-master/product-variants/:id - Update product variant
router.put(
  '/:id',
  validate(variantIdParamSchema, 'params'),
  validate(updateProductVariantSchema, 'body'),
  updateVariant
);

// PATCH /api/product-master/product-variants/:id/status - Update variant active status
router.patch(
  '/:id/status',
  validate(variantIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/product-variants/:id/set-default - Designate variant as default
router.post(
  '/:id/set-default',
  validate(variantIdParamSchema, 'params'),
  setDefaultVariant
);

// DELETE /api/product-master/product-variants/:id - Delete product variant
router.delete('/:id', validate(variantIdParamSchema, 'params'), deleteVariant);

export default router;
