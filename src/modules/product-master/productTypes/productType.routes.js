import { Router } from 'express';
import {
  getAll,
  getAllUnpaginated,
  getStats,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteProductType,
  seedDefaults,
  checkProductTypeName,
  checkProductTypeCode,
} from './productType.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  createProductTypeSchema,
  updateProductTypeSchema,
  updateStatusSchema,
  productTypeIdParamSchema,
  companyIdParamSchema,
  typeCodeParamSchema,
  getProductTypesQuerySchema,
  getAllProductTypesQuerySchema,
  getProductTypeStatsQuerySchema,
  checkProductTypeNameQuerySchema,
  checkProductTypeCodeQuerySchema,
  seedDefaultProductTypesSchema,
} from './productType.validation.js';

const router = Router();

// GET /api/product-master/product-types - List product types with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'GET ALL PRODUCT TYPES',
    controller: 'productTypeController.getAll',
    service: 'productTypeService.getProductTypes',
    operation: 'Fetch product types with pagination & filters',
  }),
  verifyToken,
  validate(getProductTypesQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/product-types/all - List all product types without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'GET ALL PRODUCT TYPES (UNPAGINATED)',
    controller: 'productTypeController.getAllUnpaginated',
    service: 'productTypeService.getAllProductTypes',
    operation: 'Fetch all product types for company without pagination',
  }),
  verifyToken,
  validate(getAllProductTypesQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/product-types/stats - Product type metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'GET PRODUCT TYPE STATS',
    controller: 'productTypeController.getStats',
    service: 'productTypeService.getProductTypeStats',
    operation: 'Fetch product type statistics for company',
  }),
  verifyToken,
  validate(getProductTypeStatsQuerySchema, 'query'),
  getStats
);

// GET /api/product-master/product-types/check-name - Check if product type name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'CHECK PRODUCT TYPE NAME',
    controller: 'productTypeController.checkProductTypeName',
    service: 'productTypeService.checkProductTypeNameExists',
    operation: 'Check if product type name already exists in company scope',
  }),
  verifyToken,
  validate(checkProductTypeNameQuerySchema, 'query'),
  checkProductTypeName
);

// GET /api/product-master/product-types/check-code - Check if product type code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'CHECK PRODUCT TYPE CODE',
    controller: 'productTypeController.checkProductTypeCode',
    service: 'productTypeService.checkProductTypeCodeExists',
    operation: 'Check if product type code already exists in company scope',
  }),
  verifyToken,
  validate(checkProductTypeCodeQuerySchema, 'query'),
  checkProductTypeCode
);

// POST /api/product-master/product-types/seed-defaults - Seed standard default product types
router.post(
  '/seed-defaults',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'SEED DEFAULT PRODUCT TYPES',
    controller: 'productTypeController.seedDefaults',
    service: 'productTypeService.seedDefaultProductTypes',
    operation: 'Seed standard default product types for company',
  }),
  verifyToken,
  validate(seedDefaultProductTypesSchema, 'body'),
  seedDefaults
);

// GET /api/product-master/product-types/company/:companyId - List all product types for a specific company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'GET COMPANY PRODUCT TYPES',
    controller: 'productTypeController.getByCompanyId',
    service: 'productTypeService.getProductTypesByCompanyId',
    operation: 'Fetch all product types for a given company',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/product-types/code/:companyId/:typeCode - Get product type by company and code
router.get(
  '/code/:companyId/:typeCode',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'GET PRODUCT TYPE BY CODE',
    controller: 'productTypeController.getByCode',
    service: 'productTypeService.getProductTypeByCode',
    operation: 'Fetch product type by company ID and type code',
  }),
  verifyToken,
  validate(typeCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/product-types/:id - Get product type by ID
router.get(
  '/:id',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'GET PRODUCT TYPE BY ID',
    controller: 'productTypeController.getById',
    service: 'productTypeService.getProductTypeById',
    operation: 'Fetch product type details by ID',
  }),
  verifyToken,
  validate(productTypeIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/product-types - Create new product type
router.post(
  '/',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'CREATE PRODUCT TYPE',
    controller: 'productTypeController.create',
    service: 'productTypeService.createProductType',
    operation: 'Create a new product type',
  }),
  verifyToken,
  validate(createProductTypeSchema, 'body'),
  create
);

// PUT /api/product-master/product-types/:id - Update existing product type
router.put(
  '/:id',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'UPDATE PRODUCT TYPE',
    controller: 'productTypeController.update',
    service: 'productTypeService.updateProductType',
    operation: 'Update existing product type details',
  }),
  verifyToken,
  validate(productTypeIdParamSchema, 'params'),
  validate(updateProductTypeSchema, 'body'),
  update
);

// PATCH /api/product-master/product-types/:id/status - Update product type active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'UPDATE PRODUCT TYPE STATUS',
    controller: 'productTypeController.updateStatus',
    service: 'productTypeService.updateProductTypeStatus',
    operation: 'Toggle or update product type active status',
  }),
  verifyToken,
  validate(productTypeIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/product-types/:id - Delete product type
router.delete(
  '/:id',
  setApiContext({
    module: 'PRODUCT_TYPE',
    category: 'PRODUCT TYPE MANAGEMENT',
    subcategory: 'DELETE PRODUCT TYPE',
    controller: 'productTypeController.deleteProductType',
    service: 'productTypeService.deleteProductType',
    operation: 'Delete product type by ID',
  }),
  verifyToken,
  validate(productTypeIdParamSchema, 'params'),
  deleteProductType
);

export default router;
