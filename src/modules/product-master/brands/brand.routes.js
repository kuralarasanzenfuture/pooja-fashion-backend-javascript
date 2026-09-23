import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  uploadLogo,
  deleteLogo,
  deleteBrand,
} from './brand.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  brandLogoUploadFields,
  resolveBrandContext,
} from './brand.middleware.js';
import {
  createBrandSchema,
  updateBrandSchema,
  updateStatusSchema,
  brandIdParamSchema,
  companyIdParamSchema,
  brandCodeParamSchema,
  getBrandsQuerySchema,
} from './brand.validation.js';

const router = Router();

// GET /api/product-master/brands - List brands with pagination & filters
router.get('/', validate(getBrandsQuerySchema, 'query'), getAll);

// GET /api/product-master/brands/company/:companyId - List all brands for a company
router.get(
  '/company/:companyId',
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/brands/code/:companyId/:brandCode - Get by company ID and code
router.get(
  '/code/:companyId/:brandCode',
  validate(brandCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/brands/:id - Get brand by ID
router.get('/:id', validate(brandIdParamSchema, 'params'), getById);

// POST /api/product-master/brands - Create brand (supports JSON or multipart logo upload)
router.post(
  '/',
  brandLogoUploadFields,
  validate(createBrandSchema, 'body'),
  create
);

// PUT /api/product-master/brands/:id - Update existing brand
router.put(
  '/:id',
  resolveBrandContext,
  brandLogoUploadFields,
  validate(brandIdParamSchema, 'params'),
  validate(updateBrandSchema, 'body'),
  update
);

// PATCH /api/product-master/brands/:id/status - Update brand active status
router.patch(
  '/:id/status',
  validate(brandIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/brands/:id/logo - Upload/replace brand logo
router.post(
  '/:id/logo',
  resolveBrandContext,
  brandLogoUploadFields,
  validate(brandIdParamSchema, 'params'),
  uploadLogo
);

// DELETE /api/product-master/brands/:id/logo - Delete brand logo
router.delete(
  '/:id/logo',
  validate(brandIdParamSchema, 'params'),
  deleteLogo
);

// DELETE /api/product-master/brands/:id - Delete brand
router.delete(
  '/:id',
  validate(brandIdParamSchema, 'params'),
  deleteBrand
);

export default router;
