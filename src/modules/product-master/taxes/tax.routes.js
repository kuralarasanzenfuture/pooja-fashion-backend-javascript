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
  deleteTax,
  seedDefaults,
  calculateTax,
  checkTaxName,
  checkTaxCode,
} from './tax.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  taxIdParamSchema,
  companyIdParamSchema,
  taxCodeParamSchema,
  createTaxSchema,
  updateTaxSchema,
  updateTaxStatusSchema,
  calculateTaxSchema,
  getTaxesQuerySchema,
  getAllTaxesQuerySchema,
  getTaxStatsQuerySchema,
  checkTaxNameQuerySchema,
  checkTaxCodeQuerySchema,
  seedDefaultTaxesSchema,
} from './tax.validation.js';

const router = Router();

// GET /api/taxes - List taxes with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'GET ALL TAXES',
    controller: 'taxController.getAll',
    service: 'taxService.getTaxes',
    operation: 'Fetch taxes with pagination & filters',
  }),
  verifyToken,
  validate(getTaxesQuerySchema, 'query'),
  getAll
);

// GET /api/taxes/all - List all taxes without pagination (for dropdowns / selectors)
router.get(
  '/all',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'GET ALL TAXES (UNPAGINATED)',
    controller: 'taxController.getAllUnpaginated',
    service: 'taxService.getAllTaxes',
    operation: 'Fetch all taxes for company without pagination',
  }),
  verifyToken,
  validate(getAllTaxesQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/taxes/stats - Tax metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'GET TAX STATS',
    controller: 'taxController.getStats',
    service: 'taxService.getTaxStats',
    operation: 'Fetch tax statistics for company',
  }),
  verifyToken,
  validate(getTaxStatsQuerySchema, 'query'),
  getStats
);

// GET /api/taxes/check-name - Check if tax name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'CHECK TAX NAME',
    controller: 'taxController.checkTaxName',
    service: 'taxService.checkTaxNameExists',
    operation: 'Check if tax name already exists in company scope',
  }),
  verifyToken,
  validate(checkTaxNameQuerySchema, 'query'),
  checkTaxName
);

// GET /api/taxes/check-code - Check if tax code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'CHECK TAX CODE',
    controller: 'taxController.checkTaxCode',
    service: 'taxService.checkTaxCodeExists',
    operation: 'Check if tax code already exists in company scope',
  }),
  verifyToken,
  validate(checkTaxCodeQuerySchema, 'query'),
  checkTaxCode
);

// POST /api/taxes/seed-defaults - Seed standard default Indian GST slabs
router.post(
  '/seed-defaults',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'SEED DEFAULT TAXES',
    controller: 'taxController.seedDefaults',
    service: 'taxService.seedDefaultTaxes',
    operation: 'Seed standard default Indian GST slabs for company',
  }),
  verifyToken,
  validate(seedDefaultTaxesSchema, 'body'),
  seedDefaults
);

// POST /api/taxes/seed/:companyId - Seed standard Indian GST slabs by param
router.post(
  '/seed/:companyId',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'SEED DEFAULT TAXES BY COMPANY',
    controller: 'taxController.seedDefaults',
    service: 'taxService.seedDefaultTaxes',
    operation: 'Seed standard Indian GST slabs for specified company',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

// POST /api/taxes/calculate - Calculate tax breakdown for POS or billing
router.post(
  '/calculate',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'CALCULATE TAX',
    controller: 'taxController.calculateTax',
    service: 'taxService.calculateTaxBreakdown',
    operation: 'Calculate tax breakdown for an amount (inclusive/exclusive, intra/inter-state)',
  }),
  verifyToken,
  validate(calculateTaxSchema, 'body'),
  calculateTax
);

// GET /api/taxes/company/:companyId - List all taxes for a specific company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'GET COMPANY TAXES',
    controller: 'taxController.getByCompanyId',
    service: 'taxService.getTaxesByCompanyId',
    operation: 'Fetch all taxes for a given company',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/taxes/code/:companyId/:taxCode - Get tax by company and code
router.get(
  '/code/:companyId/:taxCode',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'GET TAX BY CODE',
    controller: 'taxController.getByCode',
    service: 'taxService.getTaxByCode',
    operation: 'Fetch tax by company ID and tax code',
  }),
  verifyToken,
  validate(taxCodeParamSchema, 'params'),
  getByCode
);

// GET /api/taxes/:id - Get tax by ID
router.get(
  '/:id',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'GET TAX BY ID',
    controller: 'taxController.getById',
    service: 'taxService.getTaxById',
    operation: 'Fetch tax details by ID',
  }),
  verifyToken,
  validate(taxIdParamSchema, 'params'),
  getById
);

// POST /api/taxes - Create new tax
router.post(
  '/',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'CREATE TAX',
    controller: 'taxController.create',
    service: 'taxService.createTax',
    operation: 'Create a new tax record',
  }),
  verifyToken,
  validate(createTaxSchema, 'body'),
  create
);

// PUT /api/taxes/:id - Update existing tax
router.put(
  '/:id',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'UPDATE TAX',
    controller: 'taxController.update',
    service: 'taxService.updateTax',
    operation: 'Update existing tax details',
  }),
  verifyToken,
  validate(taxIdParamSchema, 'params'),
  validate(updateTaxSchema, 'body'),
  update
);

// PATCH /api/taxes/:id/status - Update tax active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'UPDATE TAX STATUS',
    controller: 'taxController.updateStatus',
    service: 'taxService.updateTaxStatus',
    operation: 'Toggle or update tax active status',
  }),
  verifyToken,
  validate(taxIdParamSchema, 'params'),
  validate(updateTaxStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/taxes/:id - Delete tax
router.delete(
  '/:id',
  setApiContext({
    module: 'TAX',
    category: 'TAX MANAGEMENT',
    subcategory: 'DELETE TAX',
    controller: 'taxController.deleteTax',
    service: 'taxService.deleteTax',
    operation: 'Delete tax by ID',
  }),
  verifyToken,
  validate(taxIdParamSchema, 'params'),
  deleteTax
);

export default router;
