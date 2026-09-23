import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteUnit,
  seedDefaults,
} from './unit.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createUnitSchema,
  updateUnitSchema,
  updateStatusSchema,
  unitIdParamSchema,
  companyIdParamSchema,
  unitCodeParamSchema,
  getUnitsQuerySchema,
} from './unit.validation.js';

const router = Router();

// GET /api/product-master/units - List units with pagination & filters
router.get('/', validate(getUnitsQuerySchema, 'query'), getAll);

// GET /api/product-master/units/company/:companyId - List all units for a company
router.get(
  '/company/:companyId',
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/units/code/:companyId/:unitCode - Get by company and code
router.get(
  '/code/:companyId/:unitCode',
  validate(unitCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/units/:id - Get unit by ID
router.get('/:id', validate(unitIdParamSchema, 'params'), getById);

// POST /api/product-master/units - Create new unit
router.post('/', validate(createUnitSchema, 'body'), create);

// PUT /api/product-master/units/:id - Update existing unit
router.put(
  '/:id',
  validate(unitIdParamSchema, 'params'),
  validate(updateUnitSchema, 'body'),
  update
);

// PATCH /api/product-master/units/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(unitIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/units/:id - Delete unit
router.delete(
  '/:id',
  validate(unitIdParamSchema, 'params'),
  deleteUnit
);

// POST /api/product-master/units/company/:companyId/seed-defaults - Seed standard default units
router.post(
  '/company/:companyId/seed-defaults',
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

export default router;
