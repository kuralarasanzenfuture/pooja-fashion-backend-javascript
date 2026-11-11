import { Router } from 'express';
import {
  getAll,
  getAllUnpaginated,
  getTree,
  getStats,
  getSubcategories,
  reorder,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  uploadImage,
  deleteImage,
  deleteCategory,
  checkCategoryName,
  checkCategoryCode,
} from './category.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  categoryImageUploadFields,
  resolveCategoryContext,
} from './category.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  updateStatusSchema,
  categoryIdParamSchema,
  companyIdParamSchema,
  categoryCodeParamSchema,
  getCategoriesQuerySchema,
  getAllCategoriesQuerySchema,
  getCategoryTreeQuerySchema,
  reorderCategoriesSchema,
  checkCategoryNameQuerySchema,
  checkCategoryCodeQuerySchema,
} from './category.validation.js';

const router = Router();

// GET /api/product-master/categories - List categories with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'GET ALL CATEGORIES',
    controller: 'categoryController.getAll',
    service: 'categoryService.getCategories',
    operation: 'Fetch categories with pagination & filters',
  }),
  verifyToken,
  validate(getCategoriesQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/categories/all - List all categories without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'GET ALL CATEGORIES (UNPAGINATED)',
    controller: 'categoryController.getAllUnpaginated',
    service: 'categoryService.getAllCategories',
    operation: 'Fetch all categories for company without pagination',
  }),
  verifyToken,
  validate(getAllCategoriesQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/categories/tree - Hierarchical category tree with nested subcategories
router.get(
  '/tree',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'GET CATEGORY TREE',
    controller: 'categoryController.getTree',
    service: 'categoryService.getCategoryTree',
    operation: 'Fetch hierarchical category tree with nested subcategories',
  }),
  verifyToken,
  validate(getCategoryTreeQuerySchema, 'query'),
  getTree
);

// GET /api/product-master/categories/stats - Category metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'GET CATEGORY STATS',
    controller: 'categoryController.getStats',
    service: 'categoryService.getCategoryStats',
    operation: 'Fetch category metrics and counts for company',
  }),
  verifyToken,
  getStats
);

// PATCH /api/product-master/categories/reorder - Bulk reorder category display order
router.patch(
  '/reorder',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'REORDER CATEGORIES',
    controller: 'categoryController.reorder',
    service: 'categoryService.reorderCategories',
    operation: 'Bulk reorder category display positions',
  }),
  verifyToken,
  validate(reorderCategoriesSchema, 'body'),
  reorder
);

// GET /api/product-master/categories/check-name - Check if category name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'CHECK CATEGORY NAME',
    controller: 'categoryController.checkCategoryName',
    service: 'categoryService.checkCategoryNameExists',
    operation: 'Check if category name already exists in company scope',
  }),
  verifyToken,
  validate(checkCategoryNameQuerySchema, 'query'),
  checkCategoryName
);

// GET /api/product-master/categories/check-code - Check if category code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'CHECK CATEGORY CODE',
    controller: 'categoryController.checkCategoryCode',
    service: 'categoryService.checkCategoryCodeExists',
    operation: 'Check if category code already exists in company scope',
  }),
  verifyToken,
  validate(checkCategoryCodeQuerySchema, 'query'),
  checkCategoryCode
);

// GET /api/product-master/categories/company/:companyId - List all categories for a company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'GET CATEGORIES BY COMPANY ID',
    controller: 'categoryController.getByCompanyId',
    service: 'categoryService.getCategoriesByCompanyId',
    operation: 'Fetch all categories for specified company',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/categories/code/:companyId/:categoryCode - Get by company ID and code
router.get(
  '/code/:companyId/:categoryCode',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'GET CATEGORY BY CODE',
    controller: 'categoryController.getByCode',
    service: 'categoryService.getCategoryByCode',
    operation: 'Fetch single category by company ID and category code',
  }),
  verifyToken,
  validate(categoryCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/categories/:id/subcategories - List subcategories for category ID
router.get(
  '/:id/subcategories',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'GET CATEGORY SUBCATEGORIES',
    controller: 'categoryController.getSubcategories',
    service: 'categoryService.getCategorySubcategories',
    operation: 'Fetch all subcategories under category ID',
  }),
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  getSubcategories
);

// GET /api/product-master/categories/:id - Get category by ID
router.get(
  '/:id',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'GET CATEGORY BY ID',
    controller: 'categoryController.getById',
    service: 'categoryService.getCategoryById',
    operation: 'Fetch single category by primary ID',
  }),
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/categories - Create category (supports JSON and multipart image upload)
router.post(
  '/',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'CREATE CATEGORY',
    controller: 'categoryController.create',
    service: 'categoryService.createCategory',
    database: 'INSERT category',
  }),
  verifyToken,
  categoryImageUploadFields,
  validate(createCategorySchema, 'body'),
  create
);

// PUT /api/product-master/categories/:id - Update existing category
router.put(
  '/:id',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'UPDATE CATEGORY',
    controller: 'categoryController.update',
    service: 'categoryService.updateCategory',
    operation: 'UPDATE category',
  }),
  verifyToken,
  resolveCategoryContext,
  categoryImageUploadFields,
  validate(categoryIdParamSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  update
);

// PATCH /api/product-master/categories/:id/status - Update category active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'UPDATE CATEGORY STATUS',
    controller: 'categoryController.updateStatus',
    service: 'categoryService.updateCategoryStatus',
    operation: 'UPDATE STATUS category',
  }),
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/categories/:id/image - Upload/replace category image
router.post(
  '/:id/image',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'UPLOAD CATEGORY IMAGE',
    controller: 'categoryController.uploadImage',
    service: 'categoryService.uploadCategoryImage',
    operation: 'Upload or replace category image',
  }),
  verifyToken,
  resolveCategoryContext,
  categoryImageUploadFields,
  validate(categoryIdParamSchema, 'params'),
  uploadImage
);

// DELETE /api/product-master/categories/:id/image - Delete category image
router.delete(
  '/:id/image',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'DELETE CATEGORY IMAGE',
    controller: 'categoryController.deleteImage',
    service: 'categoryService.deleteCategoryImage',
    operation: 'Delete category image',
  }),
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  deleteImage
);

// DELETE /api/product-master/categories/:id - Delete category
router.delete(
  '/:id',
  setApiContext({
    module: 'CATEGORY',
    category: 'CATEGORY MANAGEMENT',
    subcategory: 'DELETE CATEGORY',
    controller: 'categoryController.deleteCategory',
    service: 'categoryService.deleteCategory',
    operation: 'DELETE category',
  }),
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  deleteCategory
);

export default router;
