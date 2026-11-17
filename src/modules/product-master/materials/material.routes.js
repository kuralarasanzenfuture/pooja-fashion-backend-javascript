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
  deleteMaterial,
  seedDefaults,
  checkMaterialName,
  checkMaterialCode,
} from './material.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  createMaterialSchema,
  updateMaterialSchema,
  updateStatusSchema,
  materialIdParamSchema,
  companyIdParamSchema,
  materialCodeParamSchema,
  getMaterialsQuerySchema,
  getAllMaterialsQuerySchema,
  getMaterialStatsQuerySchema,
  checkMaterialNameQuerySchema,
  checkMaterialCodeQuerySchema,
  seedDefaultMaterialsSchema,
} from './material.validation.js';

const router = Router();

// GET /api/product-master/materials - List materials with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'GET ALL MATERIALS',
    controller: 'materialController.getAll',
    service: 'materialService.getMaterials',
    operation: 'Fetch materials with pagination & filters',
  }),
  verifyToken,
  validate(getMaterialsQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/materials/all - List all materials without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'GET ALL MATERIALS (UNPAGINATED)',
    controller: 'materialController.getAllUnpaginated',
    service: 'materialService.getAllMaterials',
    operation: 'Fetch all materials for company without pagination',
  }),
  verifyToken,
  validate(getAllMaterialsQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/materials/stats - Material metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'GET MATERIAL STATS',
    controller: 'materialController.getStats',
    service: 'materialService.getMaterialStats',
    operation: 'Fetch material statistics for company',
  }),
  verifyToken,
  validate(getMaterialStatsQuerySchema, 'query'),
  getStats
);

// GET /api/product-master/materials/check-name - Check if material name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'CHECK MATERIAL NAME',
    controller: 'materialController.checkMaterialName',
    service: 'materialService.checkMaterialNameExists',
    operation: 'Check if material name already exists in company scope',
  }),
  verifyToken,
  validate(checkMaterialNameQuerySchema, 'query'),
  checkMaterialName
);

// GET /api/product-master/materials/check-code - Check if material code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'CHECK MATERIAL CODE',
    controller: 'materialController.checkMaterialCode',
    service: 'materialService.checkMaterialCodeExists',
    operation: 'Check if material code already exists in company scope',
  }),
  verifyToken,
  validate(checkMaterialCodeQuerySchema, 'query'),
  checkMaterialCode
);

// POST /api/product-master/materials/seed-defaults - Seed standard defaults for a company
router.post(
  '/seed-defaults',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'SEED DEFAULT MATERIALS',
    controller: 'materialController.seedDefaults',
    service: 'materialService.seedDefaultMaterials',
    operation: 'Seed standard preset materials for company',
  }),
  verifyToken,
  validate(seedDefaultMaterialsSchema, 'body'),
  seedDefaults
);

// POST /api/product-master/materials/company/:companyId/seed-defaults - Seed standard default materials (parameterized)
router.post(
  '/company/:companyId/seed-defaults',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'SEED DEFAULT MATERIALS (BY COMPANY ID)',
    controller: 'materialController.seedDefaults',
    service: 'materialService.seedDefaultMaterials',
    operation: 'Seed standard preset materials for specific company ID',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

// GET /api/product-master/materials/company/:companyId - List all materials for a company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'GET MATERIALS BY COMPANY ID',
    controller: 'materialController.getByCompanyId',
    service: 'materialService.getMaterialsByCompanyId',
    operation: 'Fetch all materials belonging to company ID',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/materials/code/:companyId/:materialCode - Get by company and code
router.get(
  '/code/:companyId/:materialCode',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'GET MATERIAL BY CODE',
    controller: 'materialController.getByCode',
    service: 'materialService.getMaterialByCode',
    operation: 'Fetch single material by company ID and material code',
  }),
  verifyToken,
  validate(materialCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/materials/code/:materialCode - Get by code in token company
router.get(
  '/code/:materialCode',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'GET MATERIAL BY CODE IN SCOPE',
    controller: 'materialController.getByCode',
    service: 'materialService.getMaterialByCode',
    operation: 'Fetch single material by material code in user company scope',
  }),
  verifyToken,
  validate(materialCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/materials/:id - Get material by ID
router.get(
  '/:id',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'GET MATERIAL BY ID',
    controller: 'materialController.getById',
    service: 'materialService.getMaterialById',
    operation: 'Fetch single material by primary ID',
  }),
  verifyToken,
  validate(materialIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/materials - Create new material
router.post(
  '/',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'CREATE MATERIAL',
    controller: 'materialController.create',
    service: 'materialService.createMaterial',
    database: 'INSERT material',
  }),
  verifyToken,
  validate(createMaterialSchema, 'body'),
  create
);

// PUT /api/product-master/materials/:id - Update existing material
router.put(
  '/:id',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'UPDATE MATERIAL',
    controller: 'materialController.update',
    service: 'materialService.updateMaterial',
    operation: 'UPDATE material',
  }),
  verifyToken,
  validate(materialIdParamSchema, 'params'),
  validate(updateMaterialSchema, 'body'),
  update
);

// PATCH /api/product-master/materials/:id/status - Update material active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'UPDATE MATERIAL STATUS',
    controller: 'materialController.updateStatus',
    service: 'materialService.updateMaterialStatus',
    operation: 'UPDATE STATUS material',
  }),
  verifyToken,
  validate(materialIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/materials/:id - Delete material
router.delete(
  '/:id',
  setApiContext({
    module: 'MATERIAL',
    category: 'MATERIAL MANAGEMENT',
    subcategory: 'DELETE MATERIAL',
    controller: 'materialController.deleteMaterial',
    service: 'materialService.deleteMaterial',
    operation: 'DELETE material',
  }),
  verifyToken,
  validate(materialIdParamSchema, 'params'),
  deleteMaterial
);

export default router;
