import * as productVariantRepository from './productVariant.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import * as productRepository from '../products/product.repository.js';
import * as sizeGroupRepository from '../sizeGroups/sizeGroup.repository.js';
import * as sizeRepository from '../sizes/size.repository.js';
import * as colorRepository from '../colors/color.repository.js';
import * as materialRepository from '../materials/material.repository.js';
import * as unitRepository from '../units/unit.repository.js';
import { toProductVariantDTO, toProductVariantListDTO } from './productVariant.mapper.js';
import { getDatabasePool } from '../../../database/connection.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate standard retail SKU from product and attribute codes
 */
export const generateSku = ({ productCode, sizeCode, colorCode, materialCode, suffix } = {}) => {
  const parts = [];
  if (productCode) parts.push(productCode.trim());
  if (sizeCode) parts.push(sizeCode.trim());
  if (colorCode) parts.push(colorCode.trim());
  if (materialCode) parts.push(materialCode.trim());
  if (suffix) parts.push(suffix.trim());

  if (parts.length === 0) {
    parts.push('SKU', Math.random().toString(36).substring(2, 7).toUpperCase());
  } else if (parts.length === 1) {
    parts.push('VAR', Math.random().toString(36).substring(2, 6).toUpperCase());
  }

  return parts
    .join('-')
    .toUpperCase()
    .replace(/[^A-Z0-9_.-]/g, '_')
    .slice(0, 100);
};

/**
 * Helper to validate relational existence and company tenancy
 */
const validateRelations = async ({
  companyId,
  productId,
  sizeGroupId,
  sizeId,
  colorId,
  materialId,
  unitId,
}) => {
  let product = null;

  if (companyId !== undefined) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }
  }

  if (productId !== undefined) {
    product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }
    if (companyId && Number(product.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Product ${productId} does not belong to company ${companyId}`);
    }
  }

  if (sizeGroupId !== undefined && sizeGroupId !== null) {
    const sizeGroup = await sizeGroupRepository.findById(sizeGroupId);
    if (!sizeGroup) {
      throw new NotFoundError(`Size group with ID ${sizeGroupId} not found`);
    }
    if (companyId && Number(sizeGroup.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Size group ${sizeGroupId} does not belong to company ${companyId}`);
    }
  }

  if (sizeId !== undefined && sizeId !== null) {
    const size = await sizeRepository.findById(sizeId);
    if (!size) {
      throw new NotFoundError(`Size with ID ${sizeId} not found`);
    }
    if (companyId && Number(size.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Size ${sizeId} does not belong to company ${companyId}`);
    }
    if (sizeGroupId && Number(size.size_group_id) !== Number(sizeGroupId)) {
      throw new BadRequestError(`Size ${sizeId} does not belong to size group ${sizeGroupId}`);
    }
  }

  if (colorId !== undefined && colorId !== null) {
    const color = await colorRepository.findById(colorId);
    if (!color) {
      throw new NotFoundError(`Color with ID ${colorId} not found`);
    }
    if (companyId && Number(color.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Color ${colorId} does not belong to company ${companyId}`);
    }
  }

  if (materialId !== undefined && materialId !== null) {
    const material = await materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundError(`Material with ID ${materialId} not found`);
    }
    if (companyId && Number(material.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Material ${materialId} does not belong to company ${companyId}`);
    }
  }

  if (unitId !== undefined && unitId !== null) {
    const unit = await unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundError(`Unit with ID ${unitId} not found`);
    }
    if (companyId && Number(unit.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Unit ${unitId} does not belong to company ${companyId}`);
    }
  }

  return { product };
};

/**
 * List product variants with pagination, filtering, and search
 */
export const getProductVariants = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const productId = query.product_id || query.productId || null;
  const sizeGroupId = query.size_group_id || null;
  const sizeId = query.size_id || null;
  const colorId = query.color_id || null;
  const materialId = query.material_id || null;
  const unitId = query.unit_id || null;
  const isDefault = query.is_default !== undefined ? query.is_default : null;
  const trackStock = query.track_stock !== undefined ? query.track_stock : null;
  const allowNegativeStock = query.allow_negative_stock !== undefined ? query.allow_negative_stock : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await productVariantRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    productId,
    sizeGroupId,
    sizeId,
    colorId,
    materialId,
    unitId,
    isDefault,
    trackStock,
    allowNegativeStock,
    isActive,
    sortBy: sortBy || 'sku',
    sortOrder: sortOrder || 'ASC',
  });

  return {
    variants: toProductVariantListDTO(rows),
    pagination: formatPaginationMeta(total, page, limit),
  };
};

/**
 * Get product variant by primary key ID
 */
export const getProductVariantById = async (id) => {
  const row = await productVariantRepository.findById(id);
  if (!row) {
    throw new NotFoundError(`Product variant with ID ${id} not found`);
  }
  return toProductVariantDTO(row);
};

/**
 * Get product variant by company ID and SKU
 */
export const getProductVariantBySku = async (companyId, sku) => {
  const row = await productVariantRepository.findBySku(companyId, sku);
  if (!row) {
    throw new NotFoundError(`Product variant with SKU '${sku}' not found for company ${companyId}`);
  }
  return toProductVariantDTO(row);
};

/**
 * Get all product variants for a given product
 */
export const getVariantsByProductId = async (productId, { isActive = null } = {}) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new NotFoundError(`Product with ID ${productId} not found`);
  }

  const rows = await productVariantRepository.findByProductId(productId, { isActive });
  return toProductVariantListDTO(rows);
};

/**
 * Create a new product variant with SKU generation and default variant transaction
 */
export const createProductVariant = async (data) => {
  const { product } = await validateRelations({
    companyId: data.company_id,
    productId: data.product_id,
    sizeGroupId: data.size_group_id,
    sizeId: data.size_id,
    colorId: data.color_id,
    materialId: data.material_id,
    unitId: data.unit_id,
  });

  // Default unit_id to product's default_unit_id if omitted
  const unitId = data.unit_id || (product ? Number(product.default_unit_id) : null);
  if (!unitId) {
    throw new BadRequestError('Unit ID is required or must be set on parent product');
  }

  // Auto-generate SKU if omitted
  let sku = data.sku;
  if (!sku) {
    let sizeCode = null;
    let colorCode = null;
    let materialCode = null;

    if (data.size_id) {
      const s = await sizeRepository.findById(data.size_id);
      sizeCode = s?.size_code;
    }
    if (data.color_id) {
      const c = await colorRepository.findById(data.color_id);
      colorCode = c?.color_code;
    }
    if (data.material_id) {
      const m = await materialRepository.findById(data.material_id);
      materialCode = m?.material_code;
    }

    sku = generateSku({
      productCode: product?.product_code,
      sizeCode,
      colorCode,
      materialCode,
    });
  }

  const skuExists = await productVariantRepository.existsBySku(data.company_id, sku);
  if (skuExists) {
    throw new BadRequestError(`Product variant SKU '${sku}' is already in use for this company`);
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (data.is_default) {
      await productVariantRepository.clearDefault(data.product_id, client);
    }

    const created = await productVariantRepository.create(
      {
        ...data,
        sku,
        unit_id: unitId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductVariantDTO(created);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update an existing product variant
 */
export const updateProductVariant = async (id, data) => {
  const existing = await productVariantRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product variant with ID ${id} not found`);
  }

  const effectiveCompanyId = data.company_id !== undefined ? data.company_id : Number(existing.company_id);
  const effectiveProductId = data.product_id !== undefined ? data.product_id : Number(existing.product_id);
  const effectiveSizeGroupId =
    data.size_group_id !== undefined ? data.size_group_id : existing.size_group_id ? Number(existing.size_group_id) : null;
  const effectiveSizeId =
    data.size_id !== undefined ? data.size_id : existing.size_id ? Number(existing.size_id) : null;
  const effectiveColorId =
    data.color_id !== undefined ? data.color_id : existing.color_id ? Number(existing.color_id) : null;
  const effectiveMaterialId =
    data.material_id !== undefined ? data.material_id : existing.material_id ? Number(existing.material_id) : null;
  const effectiveUnitId =
    data.unit_id !== undefined ? data.unit_id : Number(existing.unit_id);

  await validateRelations({
    companyId: effectiveCompanyId,
    productId: effectiveProductId,
    sizeGroupId: effectiveSizeGroupId,
    sizeId: effectiveSizeId,
    colorId: effectiveColorId,
    materialId: effectiveMaterialId,
    unitId: effectiveUnitId,
  });

  if (data.sku) {
    const skuExists = await productVariantRepository.existsBySku(effectiveCompanyId, data.sku, id);
    if (skuExists) {
      throw new BadRequestError(`Product variant SKU '${data.sku}' is already in use for this company`);
    }
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (data.is_default) {
      await productVariantRepository.clearDefault(effectiveProductId, client);
    }

    const updated = await productVariantRepository.update(id, data, client);

    await client.query('COMMIT');
    return toProductVariantDTO(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Toggle or set product variant active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const existing = await productVariantRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product variant with ID ${id} not found`);
  }

  const updated = await productVariantRepository.updateStatus(id, isActive, updatedBy);
  return toProductVariantDTO(updated);
};

/**
 * Designate a variant as the default variant for its product
 */
export const setDefaultVariant = async (id, updatedBy = null) => {
  const existing = await productVariantRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product variant with ID ${id} not found`);
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await productVariantRepository.clearDefault(existing.product_id, client);
    const updated = await productVariantRepository.update(id, { is_default: true, updated_by: updatedBy }, client);
    await client.query('COMMIT');
    return toProductVariantDTO(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete product variant by ID
 */
export const deleteProductVariant = async (id) => {
  const existing = await productVariantRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product variant with ID ${id} not found`);
  }

  const priceHistoryCount = await productVariantRepository.countPriceHistories(id);
  if (priceHistoryCount > 0) {
    throw new BadRequestError(
      `Cannot delete product variant '${existing.sku}' because it has ${priceHistoryCount} associated price history record(s)`
    );
  }

  const deleted = await productVariantRepository.deleteById(id);
  return toProductVariantDTO(deleted);
};

export default {
  generateSku,
  getProductVariants,
  getProductVariantById,
  getProductVariantBySku,
  getVariantsByProductId,
  createProductVariant,
  updateProductVariant,
  updateStatus,
  setDefaultVariant,
  deleteProductVariant,
};
