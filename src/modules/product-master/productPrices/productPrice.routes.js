import { Router } from 'express';
import {
  createProductPrice,
  getProductPrices,
  getProductPriceById,
  getCurrentPrice,
  updateProductPrice,
  updateProductPriceStatus,
  deleteProductPrice,
  getProductPriceHistory,
  getPriceHistoryByPriceId,
} from './productPrice.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  priceIdParamSchema,
  createProductPriceSchema,
  updateProductPriceSchema,
  updatePriceStatusSchema,
  getCurrentPriceQuerySchema,
  getProductPricesQuerySchema,
  getPriceHistoryQuerySchema,
} from './productPrice.validation.js';

const router = Router();

// GET /api/product-prices/history - Global price audit history
router.get(
  '/history',
  validate(getPriceHistoryQuerySchema, 'query'),
  getProductPriceHistory
);

// GET /api/product-prices/current - Resolve active price for POS / billing checkout
router.get(
  '/current',
  validate(getCurrentPriceQuerySchema, 'query'),
  getCurrentPrice
);

// GET /api/product-prices - List prices with filters & pagination
router.get(
  '/',
  validate(getProductPricesQuerySchema, 'query'),
  getProductPrices
);

// GET /api/product-prices/:id/history - Audit history for a specific price ID
router.get(
  '/:id/history',
  validate(priceIdParamSchema, 'params'),
  getPriceHistoryByPriceId
);

// GET /api/product-prices/:id - Get price by ID
router.get(
  '/:id',
  validate(priceIdParamSchema, 'params'),
  getProductPriceById
);

// POST /api/product-prices - Create new price
router.post(
  '/',
  validate(createProductPriceSchema, 'body'),
  createProductPrice
);

// PUT /api/product-prices/:id - Update price (records audit trail)
router.put(
  '/:id',
  validate(priceIdParamSchema, 'params'),
  validate(updateProductPriceSchema, 'body'),
  updateProductPrice
);

// PATCH /api/product-prices/:id/status - Toggle active status
router.patch(
  '/:id/status',
  validate(priceIdParamSchema, 'params'),
  validate(updatePriceStatusSchema, 'body'),
  updateProductPriceStatus
);

// DELETE /api/product-prices/:id - Delete price
router.delete(
  '/:id',
  validate(priceIdParamSchema, 'params'),
  deleteProductPrice
);

export default router;
