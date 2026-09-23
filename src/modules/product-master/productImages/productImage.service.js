import * as productImageRepository from './productImage.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import * as productRepository from '../products/product.repository.js';
import * as productVariantRepository from '../productVariants/productVariant.repository.js';
import { toProductImageDTO, toProductImageListDTO } from './productImage.mapper.js';
import { getDatabasePool } from '../../../database/connection.js';
import { deleteFileByUrl } from '../../../shared/utils/file.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Extract image metadata from uploaded multer file
 */
export const extractUploadedImage = (files, productId) => {
  const result = {};
  if (!files) return result;

  const file = files.image?.[0] || files.image_url?.[0] || files.file?.[0] || (files.filename ? files : null);
  if (!file) return result;

  const folder = `product-${productId || 'general'}`;
  result.image_url = `/uploads/products/${folder}/${file.filename}`;
  result.image_key = `products/${folder}/${file.filename}`;
  result.original_file_name = file.originalname;
  result.mime_type = file.mimetype;
  result.file_size = file.size;

  return result;
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

  if (variantId !== undefined && variantId !== null) {
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
 * List product images with pagination and filters
 */
export const getProductImages = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const productId = query.product_id || query.productId || null;
  const variantId = query.variant_id || query.variantId || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await productImageRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    productId,
    variantId,
    isPrimary,
    isActive,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'ASC',
  });

  return {
    images: toProductImageListDTO(rows),
    pagination: formatPaginationMeta(total, page, limit),
  };
};

/**
 * Get product image by primary key ID
 */
export const getProductImageById = async (id) => {
  const row = await productImageRepository.findById(id);
  if (!row) {
    throw new NotFoundError(`Product image with ID ${id} not found`);
  }
  return toProductImageDTO(row);
};

/**
 * Get all images for a specific product
 */
export const getImagesByProductId = async (
  productId,
  { variantId = null, isPrimary = null, isActive = null } = {}
) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new NotFoundError(`Product with ID ${productId} not found`);
  }

  const rows = await productImageRepository.findByProductId(productId, {
    variantId,
    isPrimary,
    isActive,
  });

  return toProductImageListDTO(rows);
};

/**
 * Create a new product image with atomic primary logic
 */
export const createProductImage = async (data, uploadedFile = null) => {
  await validateRelations({
    companyId: data.company_id,
    productId: data.product_id,
    variantId: data.variant_id,
  });

  const fileMetadata = uploadedFile
    ? extractUploadedImage({ image: [uploadedFile] }, data.product_id)
    : {};

  const payload = {
    ...data,
    ...fileMetadata,
    image_url: fileMetadata.image_url || data.image_url,
  };

  if (!payload.image_url) {
    throw new BadRequestError('Image file or image_url is required');
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (payload.is_primary) {
      if (payload.variant_id) {
        await productImageRepository.clearPrimaryForVariant(payload.variant_id, client);
      } else {
        await productImageRepository.clearPrimaryForProduct(payload.product_id, client);
      }
    }

    const created = await productImageRepository.create(payload, client);

    await client.query('COMMIT');
    return toProductImageDTO(created);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update an existing product image record
 */
export const updateProductImage = async (id, data) => {
  const existing = await productImageRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product image with ID ${id} not found`);
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (data.is_primary) {
      if (existing.variant_id) {
        await productImageRepository.clearPrimaryForVariant(existing.variant_id, client);
      } else {
        await productImageRepository.clearPrimaryForProduct(existing.product_id, client);
      }
    }

    const updated = await productImageRepository.update(id, data, client);

    await client.query('COMMIT');
    return toProductImageDTO(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Toggle or update image active status
 */
export const updateStatus = async (id, isActive) => {
  const existing = await productImageRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product image with ID ${id} not found`);
  }

  const updated = await productImageRepository.updateStatus(id, isActive);
  return toProductImageDTO(updated);
};

/**
 * Set an image as primary for its product or variant
 */
export const setPrimaryImage = async (id) => {
  const existing = await productImageRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product image with ID ${id} not found`);
  }

  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (existing.variant_id) {
      await productImageRepository.clearPrimaryForVariant(existing.variant_id, client);
    } else {
      await productImageRepository.clearPrimaryForProduct(existing.product_id, client);
    }

    const updated = await productImageRepository.update(id, { is_primary: true }, client);

    await client.query('COMMIT');
    return toProductImageDTO(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Batch reorder images
 */
export const reorderImages = async (items) => {
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const item of items) {
      await productImageRepository.updateDisplayOrder(item.id, item.display_order, client);
    }

    await client.query('COMMIT');
    return { success: true, reorderedCount: items.length };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete product image and remove its physical file from disk
 */
export const deleteProductImage = async (id) => {
  const existing = await productImageRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product image with ID ${id} not found`);
  }

  // Safely delete the physical file on disk
  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  const deleted = await productImageRepository.deleteById(id);
  return toProductImageDTO(deleted);
};

export default {
  extractUploadedImage,
  getProductImages,
  getProductImageById,
  getImagesByProductId,
  createProductImage,
  updateProductImage,
  updateStatus,
  setPrimaryImage,
  reorderImages,
  deleteProductImage,
};
