import { Router } from 'express';
import {
  getAll,
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
  checkSubcategoryNameQuerySchema,
  checkSubcategoryCodeQuerySchema,
} from './subCategory.validation.js';

const router = Router();

// GET /api/product-master/subcategories - List subcategories with pagination & filters
router.get('/', verifyToken, validate(getSubcategoriesQuerySchema, 'query'), getAll);

// GET /api/product-master/subcategories/check-name - Check if subcategory name already exists
router.get(
  '/check-name',
  verifyToken,
  validate(checkSubcategoryNameQuerySchema, 'query'),
  checkSubcategoryName
);

// GET /api/product-master/subcategories/check-code - Check if subcategory code already exists
router.get(
  '/check-code',
  verifyToken,
  validate(checkSubcategoryCodeQuerySchema, 'query'),
  checkSubcategoryCode
);

// GET /api/product-master/subcategories/category/:categoryId - List all subcategories for a category
router.get(
  '/category/:categoryId',
  verifyToken,
  validate(categoryIdParamSchema, 'params'),
  getByCategoryId
);

// GET /api/product-master/subcategories/company/:companyId - List all subcategories for a company
router.get(
  '/company/:companyId',
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/subcategories/code/:companyId/:subcategoryCode - Get by company and code
router.get(
  '/code/:companyId/:subcategoryCode',
  verifyToken,
  validate(subcategoryCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/subcategories/:id - Get subcategory by ID
router.get('/:id', verifyToken, validate(subcategoryIdParamSchema, 'params'), getById);

// POST /api/product-master/subcategories - Create subcategory (supports JSON or multipart image upload)
router.post(
  '/',
  verifyToken,
  subCategoryImageUploadFields,
  validate(createSubcategorySchema, 'body'),
  create
);

// PUT /api/product-master/subcategories/:id - Update existing subcategory
router.put(
  '/:id',
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
  verifyToken,
  validate(subcategoryIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/subcategories/:id/image - Upload/replace subcategory image
router.post(
  '/:id/image',
  verifyToken,
  resolveSubcategoryContext,
  subCategoryImageUploadFields,
  validate(subcategoryIdParamSchema, 'params'),
  uploadImage
);

// DELETE /api/product-master/subcategories/:id/image - Delete subcategory image
router.delete('/:id/image', verifyToken, validate(subcategoryIdParamSchema, 'params'), deleteImage);

// DELETE /api/product-master/subcategories/:id - Delete subcategory
router.delete('/:id', verifyToken, validate(subcategoryIdParamSchema, 'params'), deleteSubcategory);

export default router;
