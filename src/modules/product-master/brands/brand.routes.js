import { Router } from 'express';
import {
  getAll,
  getAllUnpaginated,
  getStats,
  reorder,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  uploadLogo,
  deleteLogo,
  deleteBrand,
  checkBrandName,
  checkBrandCode,
} from './brand.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
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
  getAllBrandsQuerySchema,
  getBrandStatsQuerySchema,
  reorderBrandsSchema,
  checkBrandNameQuerySchema,
  checkBrandCodeQuerySchema,
} from './brand.validation.js';

const router = Router();

// GET /api/product-master/brands - List brands with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'GET ALL BRANDS',
    controller: 'brandController.getAll',
    service: 'brandService.getBrands',
    operation: 'Fetch brands with pagination & filters',
  }),
  verifyToken,
  validate(getBrandsQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/brands/all - List all brands without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'GET ALL BRANDS (UNPAGINATED)',
    controller: 'brandController.getAllUnpaginated',
    service: 'brandService.getAllBrands',
    operation: 'Fetch all brands for company without pagination',
  }),
  verifyToken,
  validate(getAllBrandsQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/brands/stats - Brand metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'GET BRAND STATS',
    controller: 'brandController.getStats',
    service: 'brandService.getBrandStats',
    operation: 'Fetch brand statistics for company',
  }),
  verifyToken,
  validate(getBrandStatsQuerySchema, 'query'),
  getStats
);

// PATCH /api/product-master/brands/reorder - Bulk reorder brand display order
router.patch(
  '/reorder',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'REORDER BRANDS',
    controller: 'brandController.reorder',
    service: 'brandService.reorderBrands',
    operation: 'Bulk reorder brand display positions',
  }),
  verifyToken,
  validate(reorderBrandsSchema, 'body'),
  reorder
);

// GET /api/product-master/brands/check-name - Check if brand name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'CHECK BRAND NAME',
    controller: 'brandController.checkBrandName',
    service: 'brandService.checkBrandNameExists',
    operation: 'Check if brand name already exists in company scope',
  }),
  verifyToken,
  validate(checkBrandNameQuerySchema, 'query'),
  checkBrandName
);

// GET /api/product-master/brands/check-code - Check if brand code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'CHECK BRAND CODE',
    controller: 'brandController.checkBrandCode',
    service: 'brandService.checkBrandCodeExists',
    operation: 'Check if brand code already exists in company scope',
  }),
  verifyToken,
  validate(checkBrandCodeQuerySchema, 'query'),
  checkBrandCode
);

// GET /api/product-master/brands/company/:companyId - List all brands for a company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'GET BRANDS BY COMPANY ID',
    controller: 'brandController.getByCompanyId',
    service: 'brandService.getBrandsByCompanyId',
    operation: 'Fetch all brands belonging to company ID',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/brands/code/:companyId/:brandCode - Get by company ID and code
router.get(
  '/code/:companyId/:brandCode',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'GET BRAND BY CODE',
    controller: 'brandController.getByCode',
    service: 'brandService.getBrandByCode',
    operation: 'Fetch single brand by company ID and brand code',
  }),
  verifyToken,
  validate(brandCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/brands/:id - Get brand by ID
router.get(
  '/:id',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'GET BRAND BY ID',
    controller: 'brandController.getById',
    service: 'brandService.getBrandById',
    operation: 'Fetch single brand by primary ID',
  }),
  verifyToken,
  validate(brandIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/brands - Create brand (supports JSON or multipart logo upload)
router.post(
  '/',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'CREATE BRAND',
    controller: 'brandController.create',
    service: 'brandService.createBrand',
    database: 'INSERT brand',
  }),
  verifyToken,
  brandLogoUploadFields,
  validate(createBrandSchema, 'body'),
  create
);

// PUT /api/product-master/brands/:id - Update existing brand
router.put(
  '/:id',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'UPDATE BRAND',
    controller: 'brandController.update',
    service: 'brandService.updateBrand',
    operation: 'UPDATE brand',
  }),
  verifyToken,
  resolveBrandContext,
  brandLogoUploadFields,
  validate(brandIdParamSchema, 'params'),
  validate(updateBrandSchema, 'body'),
  update
);

// PATCH /api/product-master/brands/:id/status - Update brand active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'UPDATE BRAND STATUS',
    controller: 'brandController.updateStatus',
    service: 'brandService.updateBrandStatus',
    operation: 'UPDATE STATUS brand',
  }),
  verifyToken,
  validate(brandIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/brands/:id/logo - Upload/replace brand logo
router.post(
  '/:id/logo',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'UPLOAD BRAND LOGO',
    controller: 'brandController.uploadLogo',
    service: 'brandService.uploadBrandLogo',
    operation: 'Upload or replace brand logo',
  }),
  verifyToken,
  resolveBrandContext,
  brandLogoUploadFields,
  validate(brandIdParamSchema, 'params'),
  uploadLogo
);

// DELETE /api/product-master/brands/:id/logo - Delete brand logo
router.delete(
  '/:id/logo',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'DELETE BRAND LOGO',
    controller: 'brandController.deleteLogo',
    service: 'brandService.deleteBrandLogo',
    operation: 'Delete brand logo',
  }),
  verifyToken,
  validate(brandIdParamSchema, 'params'),
  deleteLogo
);

// DELETE /api/product-master/brands/:id - Delete brand
router.delete(
  '/:id',
  setApiContext({
    module: 'BRAND',
    category: 'BRAND MANAGEMENT',
    subcategory: 'DELETE BRAND',
    controller: 'brandController.deleteBrand',
    service: 'brandService.deleteBrand',
    operation: 'DELETE brand',
  }),
  verifyToken,
  validate(brandIdParamSchema, 'params'),
  deleteBrand
);

export default router;
