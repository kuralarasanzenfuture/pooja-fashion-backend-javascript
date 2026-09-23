import { getDatabasePool } from '../../../database/connection.js';
import * as productDiscountRepo from './productDiscount.repository.js';
import * as discountService from '../discounts/discount.service.js';
import {
  toProductDiscountDTO,
  toProductDiscountsDTO,
  toResolvedDiscountDTO,
} from './productDiscount.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Creates a new product discount mapping with atomic primary handling
 */
export const createProductDiscount = async (data, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify relational hierarchy: company -> product -> (optional variant) -> discount
    const { valid, error } = await productDiscountRepo.verifyHierarchy(
      data.company_id,
      data.product_id,
      data.variant_id,
      data.discount_id,
      client
    );
    if (!valid) {
      throw new BadRequestError(error);
    }

    // 2. Prevent duplicate mapping
    const existingMapping = await productDiscountRepo.findExistingMapping(
      data.company_id,
      data.product_id,
      data.variant_id,
      data.discount_id,
      null,
      client
    );
    if (existingMapping) {
      throw new BadRequestError('This discount is already assigned to this product or variant');
    }

    // 3. If is_primary = true, clear previous primary discount
    if (data.is_primary) {
      if (data.variant_id) {
        await productDiscountRepo.clearPrimaryForVariant(data.variant_id, client);
      } else {
        await productDiscountRepo.clearPrimaryForProduct(data.product_id, client);
      }
    }

    // 4. Create mapping
    const created = await productDiscountRepo.createProductDiscount(
      {
        ...data,
        created_by: userId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductDiscountDTO(created);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Gets product discounts with filters and pagination
 */
export const getProductDiscounts = async (filters) => {
  const result = await productDiscountRepo.findProductDiscounts(filters);
  return {
    product_discounts: toProductDiscountsDTO(result.product_discounts),
    pagination: result.pagination,
  };
};

/**
 * Gets a single product discount by ID
 */
export const getProductDiscountById = async (id) => {
  const productDiscount = await productDiscountRepo.findProductDiscountById(id);
  if (!productDiscount) {
    throw new NotFoundError('Product discount not found');
  }
  return toProductDiscountDTO(productDiscount);
};

/**
 * Gets all discounts assigned to a product and its variants
 */
export const getProductDiscountsByProductId = async (productId) => {
  const rows = await productDiscountRepo.findProductDiscountsByProductId(productId);
  return toProductDiscountsDTO(rows);
};

/**
 * Resolves effective discount for POS checkout with optional real-time calculation
 */
export const resolveEffectiveDiscount = async (params) => {
  const { company_id, product_id, variant_id = null, amount, quantity = 1, as_of } = params;
  const asOfDate = as_of || new Date().toISOString();

  const resolved = await productDiscountRepo.resolveEffectiveDiscount(
    company_id,
    product_id,
    variant_id,
    asOfDate
  );

  if (!resolved) {
    return null;
  }

  let calc = null;
  if (amount !== undefined && amount !== null) {
    calc = await discountService.calculateDiscount({
      amount: Number(amount),
      quantity: Number(quantity || 1),
      discount_type: resolved.discount_type,
      discount_value: Number(resolved.discount_value),
      minimum_quantity: resolved.minimum_quantity ? Number(resolved.minimum_quantity) : null,
      maximum_discount: resolved.maximum_discount ? Number(resolved.maximum_discount) : null,
      as_of: asOfDate,
    });
  }

  return toResolvedDiscountDTO(resolved, calc);
};

/**
 * Updates an existing product discount mapping
 */
export const updateProductDiscount = async (id, data, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await productDiscountRepo.findProductDiscountById(id, client);
    if (!existing) {
      throw new NotFoundError('Product discount not found');
    }

    if (data.discount_id) {
      const { valid, error } = await productDiscountRepo.verifyHierarchy(
        existing.company_id,
        existing.product_id,
        existing.variant_id,
        data.discount_id,
        client
      );
      if (!valid) {
        throw new BadRequestError(error);
      }

      const duplicate = await productDiscountRepo.findExistingMapping(
        existing.company_id,
        existing.product_id,
        existing.variant_id,
        data.discount_id,
        id,
        client
      );
      if (duplicate) {
        throw new BadRequestError('This discount is already assigned to this product or variant');
      }
    }

    if (data.is_primary) {
      if (existing.variant_id) {
        await productDiscountRepo.clearPrimaryForVariant(existing.variant_id, client);
      } else {
        await productDiscountRepo.clearPrimaryForProduct(existing.product_id, client);
      }
    }

    const updated = await productDiscountRepo.updateProductDiscount(
      id,
      {
        ...data,
        updated_by: userId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductDiscountDTO(updated);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Toggles active status of a product discount mapping
 */
export const updateProductDiscountStatus = async (id, isActive, userId = null) => {
  const existing = await productDiscountRepo.findProductDiscountById(id);
  if (!existing) {
    throw new NotFoundError('Product discount not found');
  }

  const updated = await productDiscountRepo.updateProductDiscountStatus(id, isActive, userId);
  return toProductDiscountDTO(updated);
};

/**
 * Sets a discount mapping as primary for its variant or product
 */
export const setPrimaryProductDiscount = async (id, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await productDiscountRepo.findProductDiscountById(id, client);
    if (!existing) {
      throw new NotFoundError('Product discount not found');
    }

    if (existing.variant_id) {
      await productDiscountRepo.clearPrimaryForVariant(existing.variant_id, client);
    } else {
      await productDiscountRepo.clearPrimaryForProduct(existing.product_id, client);
    }

    const updated = await productDiscountRepo.updateProductDiscount(
      id,
      {
        is_primary: true,
        updated_by: userId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductDiscountDTO(updated);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Deletes a product discount record
 */
export const deleteProductDiscount = async (id) => {
  const existing = await productDiscountRepo.findProductDiscountById(id);
  if (!existing) {
    throw new NotFoundError('Product discount not found');
  }

  await productDiscountRepo.deleteProductDiscount(id);
  return true;
};

/**
 * Bulk assigns a discount campaign across multiple products
 */
export const bulkAssignDiscount = async (data, userId = null) => {
  const { company_id, discount_id, product_ids, is_primary = false } = data;
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const assigned = [];
    for (const productId of product_ids) {
      const { valid } = await productDiscountRepo.verifyHierarchy(
        company_id,
        productId,
        null,
        discount_id,
        client
      );

      if (valid) {
        const existing = await productDiscountRepo.findExistingMapping(
          company_id,
          productId,
          null,
          discount_id,
          null,
          client
        );

        if (!existing) {
          if (is_primary) {
            await productDiscountRepo.clearPrimaryForProduct(productId, client);
          }

          const created = await productDiscountRepo.createProductDiscount(
            {
              company_id,
              product_id: productId,
              variant_id: null,
              discount_id,
              is_primary,
              created_by: userId,
            },
            client
          );

          assigned.push(toProductDiscountDTO(created));
        }
      }
    }

    await client.query('COMMIT');
    return {
      assigned_count: assigned.length,
      product_discounts: assigned,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
