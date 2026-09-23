import { Router } from 'express';
import {
  createDiscount,
  getDiscounts,
  getDiscountById,
  updateDiscount,
  updateDiscountStatus,
  deleteDiscount,
  seedStandardDiscounts,
  calculateDiscount,
} from './discount.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  discountIdParamSchema,
  companyIdParamSchema,
  createDiscountSchema,
  updateDiscountSchema,
  updateDiscountStatusSchema,
  calculateDiscountSchema,
  getDiscountsQuerySchema,
} from './discount.validation.js';

const router = Router();

// POST /api/discounts/seed/:companyId - Seed standard apparel promotional discounts
router.post(
  '/seed/:companyId',
  validate(companyIdParamSchema, 'params'),
  seedStandardDiscounts
);

// POST /api/discounts/calculate - Calculate discount deduction & savings percentage
router.post(
  '/calculate',
  validate(calculateDiscountSchema, 'body'),
  calculateDiscount
);

// GET /api/discounts - List discounts with filters & pagination
router.get(
  '/',
  validate(getDiscountsQuerySchema, 'query'),
  getDiscounts
);

// GET /api/discounts/:id - Get discount by ID
router.get(
  '/:id',
  validate(discountIdParamSchema, 'params'),
  getDiscountById
);

// POST /api/discounts - Create new discount
router.post(
  '/',
  validate(createDiscountSchema, 'body'),
  createDiscount
);

// PUT /api/discounts/:id - Update discount
router.put(
  '/:id',
  validate(discountIdParamSchema, 'params'),
  validate(updateDiscountSchema, 'body'),
  updateDiscount
);

// PATCH /api/discounts/:id/status - Toggle active status
router.patch(
  '/:id/status',
  validate(discountIdParamSchema, 'params'),
  validate(updateDiscountStatusSchema, 'body'),
  updateDiscountStatus
);

// DELETE /api/discounts/:id - Delete discount
router.delete(
  '/:id',
  validate(discountIdParamSchema, 'params'),
  deleteDiscount
);

export default router;
