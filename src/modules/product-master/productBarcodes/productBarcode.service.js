import * as productBarcodeRepository from './productBarcode.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import * as productRepository from '../products/product.repository.js';
import * as productVariantRepository from '../productVariants/productVariant.repository.js';
import { toProductBarcodeDTO, toProductBarcodeListDTO } from './productBarcode.mapper.js';
import { getDatabasePool } from '../../../database/connection.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate standard 12/13-digit internal retail barcode
 */
export const generateInternalBarcode = (companyId = 1, variantId = 1) => {
  const compStr = String(companyId).padStart(3, '0').slice(-3);
  const varStr = String(variantId).padStart(5, '0').slice(-5);
  const rand = Math.floor(100 + Math.random() * 900);
  return `890${compStr}${varStr}${rand}`;
};

/**
 * Helper to validate relations between company, product, and variant
 */
const validateRelations = async ({ companyId, productId, variantId }) => {
  if (companyId !== undefined) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }
  }

  if (productId !== undefined) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }
    if (companyId && Number(product.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Product ${productId} does not belong to company ${companyId}`);
    }
  }

  if (variantId !== undefined) {
    const variant = await productVariantRepository.findById(variantId);
    if (!variant) {
      throw new NotFoundError(`Product variant with ID ${variantId} not found`);
    }
    if (companyId && Number(variant.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Variant ${variantId} does not belong to company ${companyId}`);
    }
    if (productId && Number(variant.product_id) !== Number(productId)) {
      throw new BadRequestError(`Variant ${variantId} does not belong to product ${productId}`);
    }
  }
};

/**
 * List product barcodes with pagination, filtering, and search
 */
export const getProductBarcodes = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const productId = query.product_id || query.productId || null;
  const variantId = query.variant_id || query.variantId || null;
  const barcodeType = query.barcode_type || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await productBarcodeRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    productId,
    variantId,
    barcodeType,
    isPrimary,
    isActive,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'DESC',
  });

  return {
    barcodes: toProductBarcodeListDTO(rows),
    pagination: formatPaginationMeta(total, page, limit),
  };
};

/**
 * Get barcode by primary key ID
 */
export const getBarcodeById = async (id) => {
  const row = await productBarcodeRepository.findById(id);
  if (!row) {
    throw new NotFoundError(`Product barcode with ID ${id} not found`);
  }
  return toProductBarcodeDTO(row);
};

/**
 * POS scan barcode resolver
 */
export const scanBarcode = async (companyId, barcode) => {
  const row = await productBarcodeRepository.findByBarcode(companyId, barcode);
  if (!row) {
    throw new NotFoundError(`No product or variant found for barcode '${barcode}'`);
  }
  return toProductBarcodeDTO(row);
};

/**
 * Get all barcodes for a variant
 */
export const getBarcodesByVariantId = async (variantId, { isActive = null } = {}) => {
  const variant = await productVariantRepository.findById(variantId);
  if (!variant) {
    throw new NotFoundError(`Product variant with ID ${variantId} not found`);
  }

  const rows = await productBarcodeRepository.findByVariantId(variantId, { isActive });
  return toProductBarcodeListDTO(rows);
};

/**
 * Create a new product barcode with atomic primary check
 */
export const createProductBarcode = async (data) => {
  await validateRelations({
    companyId: data.company_id,
    productId: data.product_id,
    variantId: data.variant_id,
  });

  const barcode = data.barcode || generateInternalBarcode(data.company_id, data.variant_id);

  const barcodeExists = await productBarcodeRepository.existsByBarcode(data.company_id, barcode);
  if (barcodeExists) {
    throw new BadRequestError(`Barcode '${barcode}' is already in use for this company`);
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (data.is_primary) {
      await productBarcodeRepository.clearPrimary(data.variant_id, client);
    }

    const created = await productBarcodeRepository.create(
      {
        ...data,
        barcode,
      },
      client
    );

    await client.query('COMMIT');
    return toProductBarcodeDTO(created);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update an existing product barcode
 */
export const updateProductBarcode = async (id, data) => {
  const existing = await productBarcodeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product barcode with ID ${id} not found`);
  }

  if (data.barcode) {
    const barcodeExists = await productBarcodeRepository.existsByBarcode(existing.company_id, data.barcode, id);
    if (barcodeExists) {
      throw new BadRequestError(`Barcode '${data.barcode}' is already in use for this company`);
    }
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (data.is_primary) {
      await productBarcodeRepository.clearPrimary(existing.variant_id, client);
    }

    const updated = await productBarcodeRepository.update(id, data, client);

    await client.query('COMMIT');
    return toProductBarcodeDTO(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Toggle or update barcode active status
 */
export const updateStatus = async (id, isActive) => {
  const existing = await productBarcodeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product barcode with ID ${id} not found`);
  }

  const updated = await productBarcodeRepository.updateStatus(id, isActive);
  return toProductBarcodeDTO(updated);
};

/**
 * Designate a barcode as primary for its variant
 */
export const setPrimaryBarcode = async (id) => {
  const existing = await productBarcodeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product barcode with ID ${id} not found`);
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await productBarcodeRepository.clearPrimary(existing.variant_id, client);
    const updated = await productBarcodeRepository.update(id, { is_primary: true }, client);
    await client.query('COMMIT');
    return toProductBarcodeDTO(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete barcode by ID
 */
export const deleteProductBarcode = async (id) => {
  const existing = await productBarcodeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product barcode with ID ${id} not found`);
  }

  const deleted = await productBarcodeRepository.deleteById(id);
  return toProductBarcodeDTO(deleted);
};

export default {
  generateInternalBarcode,
  getProductBarcodes,
  getBarcodeById,
  scanBarcode,
  getBarcodesByVariantId,
  createProductBarcode,
  updateProductBarcode,
  updateStatus,
  setPrimaryBarcode,
  deleteProductBarcode,
};
