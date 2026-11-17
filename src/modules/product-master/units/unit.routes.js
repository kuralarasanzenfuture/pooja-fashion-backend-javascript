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
  deleteUnit,
  seedDefaults,
  checkUnitName,
  checkUnitCode,
} from './unit.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  createUnitSchema,
  updateUnitSchema,
  updateStatusSchema,
  unitIdParamSchema,
  companyIdParamSchema,
  unitCodeParamSchema,
  getUnitsQuerySchema,
  getAllUnitsQuerySchema,
  getUnitStatsQuerySchema,
  checkUnitNameQuerySchema,
  checkUnitCodeQuerySchema,
  seedDefaultUnitsSchema,
} from './unit.validation.js';

const router = Router();

// GET /api/product-master/units - List units with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'GET ALL UNITS',
    controller: 'unitController.getAll',
    service: 'unitService.getUnits',
    operation: 'Fetch units with pagination & filters',
  }),
  verifyToken,
  validate(getUnitsQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/units/all - List all units without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'GET ALL UNITS (UNPAGINATED)',
    controller: 'unitController.getAllUnpaginated',
    service: 'unitService.getAllUnits',
    operation: 'Fetch all units for company without pagination',
  }),
  verifyToken,
  validate(getAllUnitsQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/units/stats - Unit metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'GET UNIT STATS',
    controller: 'unitController.getStats',
    service: 'unitService.getUnitStats',
    operation: 'Fetch unit statistics for company',
  }),
  verifyToken,
  validate(getUnitStatsQuerySchema, 'query'),
  getStats
);

// GET /api/product-master/units/check-name - Check if unit name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'CHECK UNIT NAME',
    controller: 'unitController.checkUnitName',
    service: 'unitService.checkUnitNameExists',
    operation: 'Check if unit name already exists in company scope',
  }),
  verifyToken,
  validate(checkUnitNameQuerySchema, 'query'),
  checkUnitName
);

// GET /api/product-master/units/check-code - Check if unit code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'CHECK UNIT CODE',
    controller: 'unitController.checkUnitCode',
    service: 'unitService.checkUnitCodeExists',
    operation: 'Check if unit code already exists in company scope',
  }),
  verifyToken,
  validate(checkUnitCodeQuerySchema, 'query'),
  checkUnitCode
);

// POST /api/product-master/units/seed-defaults - Seed standard default units
router.post(
  '/seed-defaults',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'SEED DEFAULT UNITS',
    controller: 'unitController.seedDefaults',
    service: 'unitService.seedDefaultUnits',
    operation: 'Seed standard default units for company',
  }),
  verifyToken,
  validate(seedDefaultUnitsSchema, 'body'),
  seedDefaults
);

// GET /api/product-master/units/company/:companyId - List all units for a specific company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'GET COMPANY UNITS',
    controller: 'unitController.getByCompanyId',
    service: 'unitService.getUnitsByCompanyId',
    operation: 'Fetch all units for a given company',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/units/code/:companyId/:unitCode - Get unit by company and code
router.get(
  '/code/:companyId/:unitCode',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'GET UNIT BY CODE',
    controller: 'unitController.getByCode',
    service: 'unitService.getUnitByCode',
    operation: 'Fetch unit by company ID and unit code',
  }),
  verifyToken,
  validate(unitCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/units/:id - Get unit by ID
router.get(
  '/:id',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'GET UNIT BY ID',
    controller: 'unitController.getById',
    service: 'unitService.getUnitById',
    operation: 'Fetch unit details by ID',
  }),
  verifyToken,
  validate(unitIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/units - Create new unit
router.post(
  '/',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'CREATE UNIT',
    controller: 'unitController.create',
    service: 'unitService.createUnit',
    operation: 'Create a new unit',
  }),
  verifyToken,
  validate(createUnitSchema, 'body'),
  create
);

// PUT /api/product-master/units/:id - Update existing unit
router.put(
  '/:id',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'UPDATE UNIT',
    controller: 'unitController.update',
    service: 'unitService.updateUnit',
    operation: 'Update existing unit details',
  }),
  verifyToken,
  validate(unitIdParamSchema, 'params'),
  validate(updateUnitSchema, 'body'),
  update
);

// PATCH /api/product-master/units/:id/status - Update unit active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'UPDATE UNIT STATUS',
    controller: 'unitController.updateStatus',
    service: 'unitService.updateUnitStatus',
    operation: 'Toggle or update unit active status',
  }),
  verifyToken,
  validate(unitIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/units/:id - Delete unit
router.delete(
  '/:id',
  setApiContext({
    module: 'UNIT',
    category: 'UNIT MANAGEMENT',
    subcategory: 'DELETE UNIT',
    controller: 'unitController.deleteUnit',
    service: 'unitService.deleteUnit',
    operation: 'Delete unit by ID',
  }),
  verifyToken,
  validate(unitIdParamSchema, 'params'),
  deleteUnit
);

export default router;
