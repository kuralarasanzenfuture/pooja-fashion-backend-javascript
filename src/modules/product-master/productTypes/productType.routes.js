import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteProductType,
  seedDefaults,
} from './productType.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createProductTypeSchema,
  updateProductTypeSchema,
  updateStatusSchema,
  productTypeIdParamSchema,
  companyIdParamSchema,
  typeCodeParamSchema,
  getProductTypesQuerySchema,
} from './productType.validation.js';

const router = Router();

// GET /api/product-master/product-types - List product types with pagination & filters
router.get('/', validate(getProductTypesQuerySchema, 'query'), getAll);

// GET /api/product-master/product-types/company/:companyId - List all product types for a company
router.get(
  '/company/:companyId',
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/product-types/code/:companyId/:typeCode - Get by company and code
router.get(
  '/code/:companyId/:typeCode',
  validate(typeCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/product-types/:id - Get product type by ID
router.get('/:id', validate(productTypeIdParamSchema, 'params'), getById);

// POST /api/product-master/product-types - Create new product type
router.post('/', validate(createProductTypeSchema, 'body'), create);

// PUT /api/product-master/product-types/:id - Update existing product type
router.put(
  '/:id',
  validate(productTypeIdParamSchema, 'params'),
  validate(updateProductTypeSchema, 'body'),
  update
);

// PATCH /api/product-master/product-types/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(productTypeIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/product-types/:id - Delete product type
router.delete(
  '/:id',
  validate(productTypeIdParamSchema, 'params'),
  deleteProductType
);

// POST /api/product-master/product-types/company/:companyId/seed-defaults - Seed standard defaults
router.post(
  '/company/:companyId/seed-defaults',
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

export default router;
