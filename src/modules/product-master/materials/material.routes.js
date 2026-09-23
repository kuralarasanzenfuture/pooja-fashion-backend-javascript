import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteMaterial,
  seedDefaults,
} from './material.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createMaterialSchema,
  updateMaterialSchema,
  updateStatusSchema,
  materialIdParamSchema,
  companyIdParamSchema,
  materialCodeParamSchema,
  getMaterialsQuerySchema,
} from './material.validation.js';

const router = Router();

// GET /api/product-master/materials - List materials with pagination & filters
router.get('/', validate(getMaterialsQuerySchema, 'query'), getAll);

// GET /api/product-master/materials/company/:companyId - List all materials for a company
router.get(
  '/company/:companyId',
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/materials/code/:companyId/:materialCode - Get by company and code
router.get(
  '/code/:companyId/:materialCode',
  validate(materialCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/materials/:id - Get material by ID
router.get('/:id', validate(materialIdParamSchema, 'params'), getById);

// POST /api/product-master/materials - Create new material
router.post('/', validate(createMaterialSchema, 'body'), create);

// PUT /api/product-master/materials/:id - Update existing material
router.put(
  '/:id',
  validate(materialIdParamSchema, 'params'),
  validate(updateMaterialSchema, 'body'),
  update
);

// PATCH /api/product-master/materials/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(materialIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/materials/:id - Delete material
router.delete(
  '/:id',
  validate(materialIdParamSchema, 'params'),
  deleteMaterial
);

// POST /api/product-master/materials/company/:companyId/seed-defaults - Seed standard default materials
router.post(
  '/company/:companyId/seed-defaults',
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

export default router;
