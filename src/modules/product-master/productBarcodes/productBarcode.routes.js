import { Router } from 'express';
import {
  getBarcodes,
  getBarcodeById,
  scanBarcode,
  getBarcodesByVariantId,
  createBarcode,
  updateBarcode,
  updateStatus,
  setPrimaryBarcode,
  deleteBarcode,
} from './productBarcode.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createProductBarcodeSchema,
  updateProductBarcodeSchema,
  updateStatusSchema,
  barcodeIdParamSchema,
  scanBarcodeParamSchema,
  variantIdParamSchema,
  getProductBarcodesQuerySchema,
} from './productBarcode.validation.js';

const router = Router();

// GET /api/product-master/product-barcodes - List barcodes with filters
router.get('/', validate(getProductBarcodesQuerySchema, 'query'), getBarcodes);

// GET /api/product-master/product-barcodes/scan/:companyId/:barcode - POS barcode scan
router.get(
  '/scan/:companyId/:barcode',
  validate(scanBarcodeParamSchema, 'params'),
  scanBarcode
);

// GET /api/product-master/product-barcodes/variant/:variantId - Get barcodes for a variant
router.get(
  '/variant/:variantId',
  validate(variantIdParamSchema, 'params'),
  getBarcodesByVariantId
);

// GET /api/product-master/product-barcodes/:id - Get barcode by ID
router.get('/:id', validate(barcodeIdParamSchema, 'params'), getBarcodeById);

// POST /api/product-master/product-barcodes - Create a new barcode
router.post('/', validate(createProductBarcodeSchema, 'body'), createBarcode);

// PUT /api/product-master/product-barcodes/:id - Update barcode
router.put(
  '/:id',
  validate(barcodeIdParamSchema, 'params'),
  validate(updateProductBarcodeSchema, 'body'),
  updateBarcode
);

// PATCH /api/product-master/product-barcodes/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(barcodeIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// POST /api/product-master/product-barcodes/:id/set-primary - Set barcode as primary
router.post(
  '/:id/set-primary',
  validate(barcodeIdParamSchema, 'params'),
  setPrimaryBarcode
);

// DELETE /api/product-master/product-barcodes/:id - Delete barcode
router.delete('/:id', validate(barcodeIdParamSchema, 'params'), deleteBarcode);

export default router;
