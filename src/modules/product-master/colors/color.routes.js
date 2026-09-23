import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteColor,
  seedDefaults,
} from './color.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createColorSchema,
  updateColorSchema,
  updateStatusSchema,
  colorIdParamSchema,
  companyIdParamSchema,
  colorCodeParamSchema,
  getColorsQuerySchema,
} from './color.validation.js';

const router = Router();

// GET /api/product-master/colors - List colors with pagination & filters
router.get('/', validate(getColorsQuerySchema, 'query'), getAll);

// GET /api/product-master/colors/company/:companyId - List all colors for a company
router.get(
  '/company/:companyId',
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/colors/code/:companyId/:colorCode - Get by company and code
router.get(
  '/code/:companyId/:colorCode',
  validate(colorCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/colors/:id - Get color by ID
router.get('/:id', validate(colorIdParamSchema, 'params'), getById);

// POST /api/product-master/colors - Create new color
router.post('/', validate(createColorSchema, 'body'), create);

// PUT /api/product-master/colors/:id - Update existing color
router.put(
  '/:id',
  validate(colorIdParamSchema, 'params'),
  validate(updateColorSchema, 'body'),
  update
);

// PATCH /api/product-master/colors/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(colorIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/colors/:id - Delete color
router.delete(
  '/:id',
  validate(colorIdParamSchema, 'params'),
  deleteColor
);

// POST /api/product-master/colors/company/:companyId/seed-defaults - Seed standard default colors
router.post(
  '/company/:companyId/seed-defaults',
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

export default router;
