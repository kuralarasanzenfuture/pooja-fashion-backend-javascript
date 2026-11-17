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
  deleteColor,
  seedDefaults,
  checkColorName,
  checkColorCode,
} from './color.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  createColorSchema,
  updateColorSchema,
  updateStatusSchema,
  colorIdParamSchema,
  companyIdParamSchema,
  colorCodeParamSchema,
  getColorsQuerySchema,
  getAllColorsQuerySchema,
  getColorStatsQuerySchema,
  reorderColorsSchema,
  checkColorNameQuerySchema,
  checkColorCodeQuerySchema,
  seedDefaultColorsSchema,
} from './color.validation.js';

const router = Router();

// GET /api/product-master/colors - List colors with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'GET ALL COLORS',
    controller: 'colorController.getAll',
    service: 'colorService.getColors',
    operation: 'Fetch colors with pagination & filters',
  }),
  verifyToken,
  validate(getColorsQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/colors/all - List all colors without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'GET ALL COLORS (UNPAGINATED)',
    controller: 'colorController.getAllUnpaginated',
    service: 'colorService.getAllColors',
    operation: 'Fetch all colors for company without pagination',
  }),
  verifyToken,
  validate(getAllColorsQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/colors/stats - Color metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'GET COLOR STATS',
    controller: 'colorController.getStats',
    service: 'colorService.getColorStats',
    operation: 'Fetch color statistics for company',
  }),
  verifyToken,
  validate(getColorStatsQuerySchema, 'query'),
  getStats
);

// PATCH /api/product-master/colors/reorder - Bulk reorder color display order
router.patch(
  '/reorder',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'REORDER COLORS',
    controller: 'colorController.reorder',
    service: 'colorService.reorderColors',
    operation: 'Bulk reorder color display positions',
  }),
  verifyToken,
  validate(reorderColorsSchema, 'body'),
  reorder
);

// GET /api/product-master/colors/check-name - Check if color name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'CHECK COLOR NAME',
    controller: 'colorController.checkColorName',
    service: 'colorService.checkColorNameExists',
    operation: 'Check if color name already exists in company scope',
  }),
  verifyToken,
  validate(checkColorNameQuerySchema, 'query'),
  checkColorName
);

// GET /api/product-master/colors/check-code - Check if color code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'CHECK COLOR CODE',
    controller: 'colorController.checkColorCode',
    service: 'colorService.checkColorCodeExists',
    operation: 'Check if color code already exists in company scope',
  }),
  verifyToken,
  validate(checkColorCodeQuerySchema, 'query'),
  checkColorCode
);

// POST /api/product-master/colors/seed-defaults - Seed standard defaults for a company
router.post(
  '/seed-defaults',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'SEED DEFAULT COLORS',
    controller: 'colorController.seedDefaults',
    service: 'colorService.seedDefaultColors',
    operation: 'Seed standard preset colors for company',
  }),
  verifyToken,
  validate(seedDefaultColorsSchema, 'body'),
  seedDefaults
);

// POST /api/product-master/colors/company/:companyId/seed-defaults - Seed standard default colors (parameterized)
router.post(
  '/company/:companyId/seed-defaults',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'SEED DEFAULT COLORS (BY COMPANY ID)',
    controller: 'colorController.seedDefaults',
    service: 'colorService.seedDefaultColors',
    operation: 'Seed standard preset colors for specific company ID',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

// GET /api/product-master/colors/company/:companyId - List all colors for a company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'GET COLORS BY COMPANY ID',
    controller: 'colorController.getByCompanyId',
    service: 'colorService.getColorsByCompanyId',
    operation: 'Fetch all colors belonging to company ID',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/colors/code/:companyId/:colorCode - Get by company and code
router.get(
  '/code/:companyId/:colorCode',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'GET COLOR BY CODE',
    controller: 'colorController.getByCode',
    service: 'colorService.getColorByCode',
    operation: 'Fetch single color by company ID and color code',
  }),
  verifyToken,
  validate(colorCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/colors/code/:colorCode - Get by code in token company
router.get(
  '/code/:colorCode',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'GET COLOR BY CODE IN SCOPE',
    controller: 'colorController.getByCode',
    service: 'colorService.getColorByCode',
    operation: 'Fetch single color by color code in user company scope',
  }),
  verifyToken,
  validate(colorCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/colors/:id - Get color by ID
router.get(
  '/:id',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'GET COLOR BY ID',
    controller: 'colorController.getById',
    service: 'colorService.getColorById',
    operation: 'Fetch single color by primary ID',
  }),
  verifyToken,
  validate(colorIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/colors - Create new color
router.post(
  '/',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'CREATE COLOR',
    controller: 'colorController.create',
    service: 'colorService.createColor',
    database: 'INSERT color',
  }),
  verifyToken,
  validate(createColorSchema, 'body'),
  create
);

// PUT /api/product-master/colors/:id - Update existing color
router.put(
  '/:id',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'UPDATE COLOR',
    controller: 'colorController.update',
    service: 'colorService.updateColor',
    operation: 'UPDATE color',
  }),
  verifyToken,
  validate(colorIdParamSchema, 'params'),
  validate(updateColorSchema, 'body'),
  update
);

// PATCH /api/product-master/colors/:id/status - Update color active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'UPDATE COLOR STATUS',
    controller: 'colorController.updateStatus',
    service: 'colorService.updateColorStatus',
    operation: 'UPDATE STATUS color',
  }),
  verifyToken,
  validate(colorIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/colors/:id - Delete color
router.delete(
  '/:id',
  setApiContext({
    module: 'COLOR',
    category: 'COLOR MANAGEMENT',
    subcategory: 'DELETE COLOR',
    controller: 'colorController.deleteColor',
    service: 'colorService.deleteColor',
    operation: 'DELETE color',
  }),
  verifyToken,
  validate(colorIdParamSchema, 'params'),
  deleteColor
);

export default router;
