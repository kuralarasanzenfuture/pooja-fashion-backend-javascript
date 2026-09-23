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
} from './subCategory.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
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
} from './subCategory.validation.js';

const router = Router();

// GET /api/product-master/subcategories - List subcategories with pagination & filters
router.get('/', validate(getSubcategoriesQuerySchema, 'query'), getAll);

// GET /api/product-master/subcategories/category/:categoryId - List all subcategories for a category
router.get(
  '/category/:categoryId',
  validate(categoryIdParamSchema, 'params'),
  getByCategoryId
);

// GET /api/product-master/subcategories/company/:companyId - List all subcategories for a company
router.get(
  '/company/:companyId',
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/subcategories/code/:companyId/:subcategoryCode - Get by company and code
router.get(
  '/code/:companyId/:subcategoryCode',
  validate(subcategoryCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/subcategories/:id - Get subcategory by ID
router.get('/:id', validate(subcategoryIdParamSchema, 'params'), getById);

// POST /api/product-master/subcategories - Create subcategory (supports JSON or multipart image upload)
router.post(
  '/',
  subCategoryImageUploadFields,
  validate(createSubcategorySchema, 'body'),
  create
);

// PUT /api/product-master/subcategories/:id - Update existing subcategory
router.put(
  '/:id',
  resolveSubcategoryContext,
  subCategoryImageUploadFields,
  validate(subcategoryIdParamSchema, 'params'),
  validate(updateSubcategorySchema, 'body'),
  update
);

// PATCH /api/product-master/subcategories/:id/status - Update subcategory active status
router.patch(
  '/:id/status',
  validate(subcategoryIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/subcategories/:id/image - Upload/replace subcategory image
router.post(
  '/:id/image',
  resolveSubcategoryContext,
  subCategoryImageUploadFields,
  validate(subcategoryIdParamSchema, 'params'),
  uploadImage
);

// DELETE /api/product-master/subcategories/:id/image - Delete subcategory image
router.delete(
  '/:id/image',
  validate(subcategoryIdParamSchema, 'params'),
  deleteImage
);

// DELETE /api/product-master/subcategories/:id - Delete subcategory
router.delete(
  '/:id',
  validate(subcategoryIdParamSchema, 'params'),
  deleteSubcategory
);

export default router;
