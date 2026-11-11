import { Router } from 'express';
import {
  getAll,
  getAllUnpaginated,
  getStats,
  reorder,
  getById,
  getByCode,
  getByCategoryId,
  getByCompanyId,
  create,
  update,
  updateStatus,
  uploadImage,
  deleteImage,
  deleteSubcategory,
  checkSubcategoryName,
  checkSubcategoryCode,
} from './subCategory.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  subCategoryImageUploadFields,
  resolveSubcategoryContext,
} from './subCategory.middleware.js';
import {
  createSubcategorySchema,
  updateSubcategorySchema,
  updateStatusSchema,
  subcategoryIdParamSchema,
  companyIdParamSchema,
  categoryIdParamSchema,
  subcategoryCodeParamSchema,
  getSubcategoriesQuerySchema,
  getAllSubcategoriesQuerySchema,
  getSubcategoryStatsQuerySchema,
  reorderSubcategoriesSchema,
  checkSubcategoryNameQuerySchema,
  checkSubcategoryCodeQuerySchema,
} from './subCategory.validation.js';

const router = Router();

// GET /api/product-master/subcategories - List subcategories with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'GET ALL SUBCATEGORIES',
    controller: 'subCategoryController.getAll',
    service: 'subCategoryService.getSubcategories',
    operation: 'Fetch subcategories with pagination & filters',
  }),
  verifyToken,
  validate(getSubcategoriesQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/subcategories/all - List all subcategories without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'GET ALL SUBCATEGORIES (UNPAGINATED)',
    controller: 'subCategoryController.getAllUnpaginated',
    service: 'subCategoryService.getAllSubcategories',
    operation: 'Fetch all subcategories for company without pagination',
  }),
  verifyToken,
  validate(getAllSubcategoriesQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/subcategories/stats - Subcategory metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'GET SUBCATEGORY STATS',
    controller: 'subCategoryController.getStats',
    service: 'subCategoryService.getSubcategoryStats',
    operation: 'Fetch subcategory statistics for company',
  }),
  verifyToken,
  validate(getSubcategoryStatsQuerySchema, 'query'),
  getStats
);

// PATCH /api/product-master/subcategories/reorder - Bulk reorder subcategory display order
router.patch(
  '/reorder',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'REORDER SUBCATEGORIES',
    controller: 'subCategoryController.reorder',
    service: 'subCategoryService.reorderSubcategories',
    operation: 'Bulk reorder subcategory display positions',
  }),
  verifyToken,
  validate(reorderSubcategoriesSchema, 'body'),
  reorder
);

// GET /api/product-master/subcategories/check-name - Check if subcategory name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'CHECK SUBCATEGORY NAME',
    controller: 'subCategoryController.checkSubcategoryName',
    service: 'subCategoryService.checkSubcategoryNameExists',
    operation: 'Check if subcategory name already exists in category or company scope',
  }),
  verifyToken,
  validate(checkSubcategoryNameQuerySchema, 'query'),
  checkSubcategoryName
);

// GET /api/product-master/subcategories/check-code - Check if subcategory code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'CHECK SUBCATEGORY CODE',
    controller: 'subCategoryController.checkSubcategoryCode',
    service: 'subCategoryService.checkSubcategoryCodeExists',
    operation: 'Check if subcategory code already exists in company scope',
  }),
  verifyToken,
  validate(checkSubcategoryCodeQuerySchema, 'query'),
  checkSubcategoryCode
);

// GET /api/product-master/subcategories/category/:categoryId - List all subcategories for a category
router.get(
  '/category/:categoryId',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'GET SUBCATEGORIES BY CATEGORY ID',
    controller: 'subCategoryController.getByCategoryId',
    service: 'subCategoryService.getSubcategoriesByCategoryId',
    operation: 'Fetch all subcategories belonging to category ID',
  }),
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  getByCategoryId
);

// GET /api/product-master/subcategories/company/:companyId - List all subcategories for a company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'GET SUBCATEGORIES BY COMPANY ID',
    controller: 'subCategoryController.getByCompanyId',
    service: 'subCategoryService.getSubcategoriesByCompanyId',
    operation: 'Fetch all subcategories belonging to company ID',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/subcategories/code/:companyId/:subcategoryCode - Get by company and code
router.get(
  '/code/:companyId/:subcategoryCode',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'GET SUBCATEGORY BY CODE',
    controller: 'subCategoryController.getByCode',
    service: 'subCategoryService.getSubcategoryByCode',
    operation: 'Fetch single subcategory by company ID and subcategory code',
  }),
  verifyToken,
  validate(subcategoryCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/subcategories/:id - Get subcategory by ID
router.get(
  '/:id',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'GET SUBCATEGORY BY ID',
    controller: 'subCategoryController.getById',
    service: 'subCategoryService.getSubcategoryById',
    operation: 'Fetch single subcategory by primary ID',
  }),
  verifyToken,
  validate(subcategoryIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/subcategories - Create subcategory (supports JSON or multipart image upload)
router.post(
  '/',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'CREATE SUBCATEGORY',
    controller: 'subCategoryController.create',
    service: 'subCategoryService.createSubcategory',
    database: 'INSERT subcategory',
  }),
  verifyToken,
  subCategoryImageUploadFields,
  validate(createSubcategorySchema, 'body'),
  create
);

// PUT /api/product-master/subcategories/:id - Update existing subcategory
router.put(
  '/:id',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'UPDATE SUBCATEGORY',
    controller: 'subCategoryController.update',
    service: 'subCategoryService.updateSubcategory',
    operation: 'UPDATE subcategory',
  }),
  verifyToken,
  resolveSubcategoryContext,
  subCategoryImageUploadFields,
  validate(subcategoryIdParamSchema, 'params'),
  validate(updateSubcategorySchema, 'body'),
  update
);

// PATCH /api/product-master/subcategories/:id/status - Update subcategory active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'UPDATE SUBCATEGORY STATUS',
    controller: 'subCategoryController.updateStatus',
    service: 'subCategoryService.updateSubcategoryStatus',
    operation: 'UPDATE STATUS subcategory',
  }),
  verifyToken,
  validate(subcategoryIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/subcategories/:id/image - Upload/replace subcategory image
router.post(
  '/:id/image',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'UPLOAD SUBCATEGORY IMAGE',
    controller: 'subCategoryController.uploadImage',
    service: 'subCategoryService.uploadSubcategoryImage',
    operation: 'Upload or replace subcategory image',
  }),
  verifyToken,
  resolveSubcategoryContext,
  subCategoryImageUploadFields,
  validate(subcategoryIdParamSchema, 'params'),
  uploadImage
);

// DELETE /api/product-master/subcategories/:id/image - Delete subcategory image
router.delete(
  '/:id/image',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'DELETE SUBCATEGORY IMAGE',
    controller: 'subCategoryController.deleteImage',
    service: 'subCategoryService.deleteSubcategoryImage',
    operation: 'Delete subcategory image',
  }),
  verifyToken,
  validate(subcategoryIdParamSchema, 'params'),
  deleteImage
);

// DELETE /api/product-master/subcategories/:id - Delete subcategory
router.delete(
  '/:id',
  setApiContext({
    module: 'SUBCATEGORY',
    category: 'SUBCATEGORY MANAGEMENT',
    subcategory: 'DELETE SUBCATEGORY',
    controller: 'subCategoryController.deleteSubcategory',
    service: 'subCategoryService.deleteSubcategory',
    operation: 'DELETE subcategory',
  }),
  verifyToken,
  validate(subcategoryIdParamSchema, 'params'),
  deleteSubcategory
);

export default router;
