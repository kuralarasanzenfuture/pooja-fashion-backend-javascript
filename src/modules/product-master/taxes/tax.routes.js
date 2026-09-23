import { Router } from 'express';
import {
  createTax,
  getTaxes,
  getTaxById,
  updateTax,
  updateTaxStatus,
  deleteTax,
  seedDefaultTaxes,
  calculateTax,
} from './tax.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  taxIdParamSchema,
  companyIdParamSchema,
  createTaxSchema,
  updateTaxSchema,
  updateTaxStatusSchema,
  calculateTaxSchema,
  getTaxesQuerySchema,
} from './tax.validation.js';

const router = Router();

// POST /api/taxes/seed/:companyId - Seed standard Indian GST slabs
router.post(
  '/seed/:companyId',
  validate(companyIdParamSchema, 'params'),
  seedDefaultTaxes
);

// POST /api/taxes/calculate - Calculate tax breakdown for POS or billing
router.post(
  '/calculate',
  validate(calculateTaxSchema, 'body'),
  calculateTax
);

// GET /api/taxes - List taxes with filters & pagination
router.get(
  '/',
  validate(getTaxesQuerySchema, 'query'),
  getTaxes
);

// GET /api/taxes/:id - Get tax by ID
router.get(
  '/:id',
  validate(taxIdParamSchema, 'params'),
  getTaxById
);

// POST /api/taxes - Create custom tax
router.post(
  '/',
  validate(createTaxSchema, 'body'),
  createTax
);

// PUT /api/taxes/:id - Update tax
router.put(
  '/:id',
  validate(taxIdParamSchema, 'params'),
  validate(updateTaxSchema, 'body'),
  updateTax
);

// PATCH /api/taxes/:id/status - Toggle active status
router.patch(
  '/:id/status',
  validate(taxIdParamSchema, 'params'),
  validate(updateTaxStatusSchema, 'body'),
  updateTaxStatus
);

// DELETE /api/taxes/:id - Delete tax
router.delete(
  '/:id',
  validate(taxIdParamSchema, 'params'),
  deleteTax
);

export default router;
