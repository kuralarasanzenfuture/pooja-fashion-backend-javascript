import { getDatabasePool } from '../../../database/connection.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import * as priceRepo from './productPrice.repository.js';
import {
  toProductPriceDTO,
  toProductPricesDTO,
  toProductPriceHistoryDTO,
  toProductPriceHistoriesDTO,
} from './productPrice.mapper.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Creates a new product price record and automatically records the initial price audit entry
 */
export const createProductPrice = async (data, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify relational hierarchy: company -> product -> variant
    const isValidHierarchy = await priceRepo.verifyHierarchy(
      data.company_id,
      data.product_id,
      data.variant_id,
      client
    );
    if (!isValidHierarchy) {
      throw new BadRequestError('Variant does not belong to the specified product and company');
    }

    const effectiveFrom = data.effective_from || new Date().toISOString();

    // 2. If new price is active, expire previous active prices for this variant & price_type
    if (data.is_active !== false) {
      await priceRepo.expireOverlappingPrices(
        data.variant_id,
        data.price_type,
        effectiveFrom,
        client
      );
    }

    // 3. Create price record
    const createdPrice = await priceRepo.createPrice(
      {
        ...data,
        effective_from: effectiveFrom,
        created_by: userId,
      },
      client
    );

    // 4. Create initial audit trail entry
    await priceRepo.createPriceHistory(
      {
        company_id: data.company_id,
        product_id: data.product_id,
        variant_id: data.variant_id,
        product_price_id: createdPrice.id,
        price_type: data.price_type,
        old_purchase_price: null,
        new_purchase_price: data.purchase_price,
        old_cost_price: null,
        new_cost_price: data.cost_price,
        old_mrp: null,
        new_mrp: data.mrp,
        old_selling_price: null,
        new_selling_price: data.selling_price,
        reason: data.reason || 'Initial price setup',
        changed_by: userId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductPriceDTO(createdPrice);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Gets product prices with filters and pagination
 */
export const getProductPrices = async (filters) => {
  const result = await priceRepo.findPrices(filters);
  return {
    prices: toProductPricesDTO(result.prices),
    pagination: result.pagination,
  };
};

/**
 * Gets a single product price by ID
 */
export const getProductPriceById = async (id) => {
  const price = await priceRepo.findPriceById(id);
  if (!price) {
    throw new NotFoundError('Product price not found');
  }
  return toProductPriceDTO(price);
};

/**
 * Resolves current active price for POS or billing
 */
export const getCurrentActivePrice = async (variantId, priceType = 'RETAIL', asOf = null) => {
  const asOfDate = asOf || new Date().toISOString();
  const price = await priceRepo.findActivePrice(variantId, priceType, asOfDate);
  if (!price) {
    return null;
  }
  return toProductPriceDTO(price);
};

/**
 * Updates a product price and records audit history if prices or dates change
 */
export const updateProductPrice = async (id, data, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await priceRepo.findPriceById(id, client);
    if (!existing) {
      throw new NotFoundError('Product price not found');
    }

    const { reason, ...updateFields } = data;

    // Check if new price needs to expire other active prices
    if (updateFields.effective_from && updateFields.is_active !== false) {
      await priceRepo.expireOverlappingPrices(
        existing.variant_id,
        updateFields.price_type || existing.price_type,
        updateFields.effective_from,
        client
      );
    }

    const updated = await priceRepo.updatePrice(
      id,
      {
        ...updateFields,
        updated_by: userId,
      },
      client
    );

    // Check if price numbers changed
    const pricesChanged =
      (updateFields.purchase_price !== undefined &&
        Number(updateFields.purchase_price) !== Number(existing.purchase_price)) ||
      (updateFields.cost_price !== undefined &&
        Number(updateFields.cost_price) !== Number(existing.cost_price)) ||
      (updateFields.mrp !== undefined &&
        Number(updateFields.mrp) !== Number(existing.mrp)) ||
      (updateFields.selling_price !== undefined &&
        Number(updateFields.selling_price) !== Number(existing.selling_price));

    if (pricesChanged || reason) {
      await priceRepo.createPriceHistory(
        {
          company_id: existing.company_id,
          product_id: existing.product_id,
          variant_id: existing.variant_id,
          product_price_id: existing.id,
          price_type: updated.price_type,
          old_purchase_price: existing.purchase_price,
          new_purchase_price: updated.purchase_price,
          old_cost_price: existing.cost_price,
          new_cost_price: updated.cost_price,
          old_mrp: existing.mrp,
          new_mrp: updated.mrp,
          old_selling_price: existing.selling_price,
          new_selling_price: updated.selling_price,
          reason: reason || 'Price update',
          changed_by: userId,
        },
        client
      );
    }

    await client.query('COMMIT');
    return toProductPriceDTO(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Toggles active status of a product price and records audit history
 */
export const updateProductPriceStatus = async (id, isActive, reason = null, userId = null) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await priceRepo.findPriceById(id, client);
    if (!existing) {
      throw new NotFoundError('Product price not found');
    }

    const updated = await priceRepo.updatePrice(
      id,
      {
        is_active: isActive,
        updated_by: userId,
      },
      client
    );

    await priceRepo.createPriceHistory(
      {
        company_id: existing.company_id,
        product_id: existing.product_id,
        variant_id: existing.variant_id,
        product_price_id: existing.id,
        price_type: existing.price_type,
        old_purchase_price: existing.purchase_price,
        new_purchase_price: existing.purchase_price,
        old_cost_price: existing.cost_price,
        new_cost_price: existing.cost_price,
        old_mrp: existing.mrp,
        new_mrp: existing.mrp,
        old_selling_price: existing.selling_price,
        new_selling_price: existing.selling_price,
        reason: reason || (isActive ? 'Price activated' : 'Price deactivated'),
        changed_by: userId,
      },
      client
    );

    await client.query('COMMIT');
    return toProductPriceDTO(updated);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Deletes a product price
 */
export const deleteProductPrice = async (id) => {
  const existing = await priceRepo.findPriceById(id);
  if (!existing) {
    throw new NotFoundError('Product price not found');
  }

  await priceRepo.deletePrice(id);
  return true;
};

/**
 * Gets product price audit history
 */
export const getProductPriceHistory = async (filters) => {
  const result = await priceRepo.findPriceHistory(filters);
  return {
    history: toProductPriceHistoriesDTO(result.history),
    pagination: result.pagination,
  };
};

/**
 * Gets price history for a specific price ID
 */
export const getPriceHistoryByPriceId = async (priceId, pagination = {}) => {
  const result = await priceRepo.findPriceHistory({
    product_price_id: priceId,
    ...pagination,
  });
  return {
    history: toProductPriceHistoriesDTO(result.history),
    pagination: result.pagination,
  };
};
