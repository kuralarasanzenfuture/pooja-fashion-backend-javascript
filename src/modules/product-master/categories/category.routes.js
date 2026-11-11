import { Router } from 'express';
import {
  getAll,
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
  checkCategoryNameQuerySchema,
  checkCategoryCodeQuerySchema,
} from './category.validation.js';

const router = Router();

// GET /api/product-master/categories - List categories with pagination & filters
router.get('/', verifyToken, validate(getCategoriesQuerySchema, 'query'), getAll);

// GET /api/product-master/categories/check-name - Check if category name already exists
router.get(
  '/check-name',
  verifyToken,
  validate(checkCategoryNameQuerySchema, 'query'),
  checkCategoryName
);

// GET /api/product-master/categories/check-code - Check if category code already exists
router.get(
  '/check-code',
  verifyToken,
  validate(checkCategoryCodeQuerySchema, 'query'),
  checkCategoryCode
);

// GET /api/product-master/categories/company/:companyId - List all categories for a company
router.get(
  '/company/:companyId',
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/categories/code/:companyId/:categoryCode - Get by company ID and code
router.get(
  '/code/:companyId/:categoryCode',
  verifyToken,
  validate(categoryCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/categories/:id - Get category by ID
router.get('/:id', verifyToken, validate(categoryIdParamSchema, 'params'), getById);

// POST /api/product-master/categories - Create category (supports JSON and multipart image upload)
router.post(
  '/',
  verifyToken,
  categoryImageUploadFields,
  validate(createCategorySchema, 'body'),
  create
);

// PUT /api/product-master/categories/:id - Update existing category
router.put(
  '/:id',
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
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/categories/:id/image - Upload/replace category image
router.post(
  '/:id/image',
  verifyToken,
  resolveCategoryContext,
  categoryImageUploadFields,
  validate(categoryIdParamSchema, 'params'),
  uploadImage
);

// DELETE /api/product-master/categories/:id/image - Delete category image
router.delete(
  '/:id/image',
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  deleteImage
);

// DELETE /api/product-master/categories/:id - Delete category
router.delete(
  '/:id',
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  deleteCategory
);

export default router;
