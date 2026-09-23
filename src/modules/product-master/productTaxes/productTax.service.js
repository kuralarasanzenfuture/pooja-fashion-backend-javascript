import { getDatabasePool } from '../../../database/connection.js';
import * as productTaxRepo from './productTax.repository.js';
import {
  toProductTaxDTO,
  toProductTaxesDTO,
  toResolvedTaxDTO,
} from './productTax.mapper.js';
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
 * Creates a new product tax mapping with atomic primary tax handling
 */
export const createProductTax = async (data, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify relational hierarchy: company -> product -> variant -> tax
    const { valid, error } = await productTaxRepo.verifyHierarchy(
      data.company_id,
      data.product_id,
      data.variant_id,
      data.tax_id,
      client
    );
    if (!valid) {
      throw new BadRequestError(error);
    }

    // 2. If is_primary = true, clear previous primary tax
    if (data.is_primary) {
      if (data.variant_id) {
        await productTaxRepo.clearPrimaryForVariant(data.variant_id, client);
      } else {
        await productTaxRepo.clearPrimaryForProduct(data.product_id, client);
      }
    }

    // 3. Create mapping
    const created = await productTaxRepo.createProductTax(
      {
        ...data,
        created_by: userId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductTaxDTO(created);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Gets product taxes with filters and pagination
 */
export const getProductTaxes = async (filters) => {
  const result = await productTaxRepo.findProductTaxes(filters);
  return {
    product_taxes: toProductTaxesDTO(result.product_taxes),
    pagination: result.pagination,
  };
};

/**
 * Gets a single product tax by ID
 */
export const getProductTaxById = async (id) => {
  const productTax = await productTaxRepo.findProductTaxById(id);
  if (!productTax) {
    throw new NotFoundError('Product tax not found');
  }
  return toProductTaxDTO(productTax);
};

/**
 * Gets all taxes assigned to a product and its variants
 */
export const getProductTaxesByProductId = async (productId) => {
  const rows = await productTaxRepo.findProductTaxesByProductId(productId);
  return toProductTaxesDTO(rows);
};

/**
 * Resolves effective tax for POS checkout (Variant first, fallback to product level)
 */
export const resolveEffectiveTax = async (companyId, productId, variantId = null, asOf = null) => {
  const asOfDate = asOf || new Date().toISOString();
  const resolved = await productTaxRepo.resolveEffectiveTax(
    companyId,
    productId,
    variantId,
    asOfDate
  );

  if (!resolved) {
    return null;
  }

  return toResolvedTaxDTO(resolved);
};

/**
 * Updates an existing product tax mapping
 */
export const updateProductTax = async (id, data, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await productTaxRepo.findProductTaxById(id, client);
    if (!existing) {
      throw new NotFoundError('Product tax not found');
    }

    // If updating tax_id, verify tax belongs to same company
    if (data.tax_id) {
      const { valid, error } = await productTaxRepo.verifyHierarchy(
        existing.company_id,
        existing.product_id,
        existing.variant_id,
        data.tax_id,
        client
      );
      if (!valid) {
        throw new BadRequestError(error);
      }
    }

    // If setting is_primary = true, clear other primary taxes
    if (data.is_primary) {
      if (existing.variant_id) {
        await productTaxRepo.clearPrimaryForVariant(existing.variant_id, client);
      } else {
        await productTaxRepo.clearPrimaryForProduct(existing.product_id, client);
      }
    }

    const updated = await productTaxRepo.updateProductTax(
      id,
      {
        ...data,
        updated_by: userId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductTaxDTO(updated);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Toggles active status of a product tax
 */
export const updateProductTaxStatus = async (id, isActive, userId = null) => {
  const existing = await productTaxRepo.findProductTaxById(id);
  if (!existing) {
    throw new NotFoundError('Product tax not found');
  }

  const updated = await productTaxRepo.updateProductTax(id, {
    is_active: isActive,
    updated_by: userId,
  });

  return toProductTaxDTO(updated);
};

/**
 * Sets a product tax as the primary tax for its product or variant
 */
export const setPrimaryProductTax = async (id, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await productTaxRepo.findProductTaxById(id, client);
    if (!existing) {
      throw new NotFoundError('Product tax not found');
    }

    if (existing.variant_id) {
      await productTaxRepo.clearPrimaryForVariant(existing.variant_id, client);
    } else {
      await productTaxRepo.clearPrimaryForProduct(existing.product_id, client);
    }

    const updated = await productTaxRepo.updateProductTax(
      id,
      {
        is_primary: true,
        updated_by: userId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductTaxDTO(updated);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Deletes a product tax record
 */
export const deleteProductTax = async (id) => {
  const existing = await productTaxRepo.findProductTaxById(id);
  if (!existing) {
    throw new NotFoundError('Product tax not found');
  }

  await productTaxRepo.deleteProductTax(id);
  return true;
};

/**
 * Bulk assigns a tax to multiple products
 */
export const bulkAssignTax = async (payload, userId = null) => {
  const { company_id, tax_id, product_ids, is_primary = false } = payload;
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const assigned = [];
    for (const productId of product_ids) {
      const { valid, error } = await productTaxRepo.verifyHierarchy(
        company_id,
        productId,
        null,
        tax_id,
        client
      );
      if (!valid) {
        throw new BadRequestError(`Product ${productId}: ${error}`);
      }

      if (is_primary) {
        await productTaxRepo.clearPrimaryForProduct(productId, client);
      }

      const created = await productTaxRepo.createProductTax(
        {
          company_id,
          product_id: productId,
          variant_id: null,
          tax_id,
          is_primary,
          created_by: userId,
        },
        client
      );
      assigned.push(toProductTaxDTO(created));
    }

    await client.query('COMMIT');
    return {
      assigned_count: assigned.length,
      product_taxes: assigned,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
