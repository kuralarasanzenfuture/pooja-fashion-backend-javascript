import * as productBarcodeService from './productBarcode.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/product-barcodes
 * List product barcodes with filters and pagination
 */
export const getBarcodes = async (req, res, next) => {
  try {
    const { barcodes, pagination } = await productBarcodeService.getProductBarcodes(req.query);
    return sendSuccess(res, barcodes, 'Product barcodes retrieved successfully', 200, pagination);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-barcodes/:id
 * Retrieve barcode by ID
 */
export const getBarcodeById = async (req, res, next) => {
  try {
    const barcode = await productBarcodeService.getBarcodeById(req.params.id);
    return sendSuccess(res, barcode, 'Product barcode retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-barcodes/scan/:companyId/:barcode
 * POS barcode scan lookup
 */
export const scanBarcode = async (req, res, next) => {
  try {
    const barcode = await productBarcodeService.scanBarcode(
      req.params.companyId,
      req.params.barcode
    );
    return sendSuccess(res, barcode, 'Scanned barcode resolved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/product-barcodes/variant/:variantId
 * Retrieve all barcodes for a variant
 */
export const getBarcodesByVariantId = async (req, res, next) => {
  try {
    const barcodes = await productBarcodeService.getBarcodesByVariantId(req.params.variantId, {
      isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
    });
    return sendSuccess(res, barcodes, 'Variant barcodes retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-barcodes
 * Create a new barcode
 */
export const createBarcode = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const barcode = await productBarcodeService.createProductBarcode(data);
    return sendCreated(res, barcode, 'Product barcode created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/product-barcodes/:id
 * Update barcode
 */
export const updateBarcode = async (req, res, next) => {
  try {
    const barcode = await productBarcodeService.updateProductBarcode(req.params.id, req.body);
    return sendSuccess(res, barcode, 'Product barcode updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/product-barcodes/:id/status
 * Update barcode active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const barcode = await productBarcodeService.updateStatus(
      req.params.id,
      req.body.is_active
    );
    return sendSuccess(res, barcode, 'Product barcode status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/product-barcodes/:id/set-primary
 * Designate barcode as primary for its variant
 */
export const setPrimaryBarcode = async (req, res, next) => {
  try {
    const barcode = await productBarcodeService.setPrimaryBarcode(req.params.id);
    return sendSuccess(res, barcode, 'Primary product barcode set successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/product-barcodes/:id
 * Delete barcode
 */
export const deleteBarcode = async (req, res, next) => {
  try {
    const result = await productBarcodeService.deleteProductBarcode(req.params.id);
    return sendSuccess(res, result, 'Product barcode deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getBarcodes,
  getBarcodeById,
  scanBarcode,
  getBarcodesByVariantId,
  createBarcode,
  updateBarcode,
  updateStatus,
  setPrimaryBarcode,
  deleteBarcode,
};
