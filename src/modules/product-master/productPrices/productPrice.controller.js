import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';
import * as priceService from './productPrice.service.js';

/**
 * Creates a new product price
 */
export const createProductPrice = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const price = await priceService.createProductPrice(req.body, userId);
    return sendCreated(res, price, 'Product price created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets product prices with filters and pagination
 */
export const getProductPrices = async (req, res, next) => {
  try {
    const { prices, pagination } = await priceService.getProductPrices(req.query);
    return sendSuccess(res, prices, 'Product prices retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a single product price by ID
 */
export const getProductPriceById = async (req, res, next) => {
  try {
    const price = await priceService.getProductPriceById(req.params.id);
    return sendSuccess(res, price, 'Product price retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Resolves current active price for POS / billing checkout
 */
export const getCurrentPrice = async (req, res, next) => {
  try {
    const { variant_id, price_type, as_of } = req.query;
    const price = await priceService.getCurrentActivePrice(variant_id, price_type, as_of);
    return sendSuccess(res, price, 'Current product price retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a product price and records audit history
 */
export const updateProductPrice = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const price = await priceService.updateProductPrice(req.params.id, req.body, userId);
    return sendSuccess(res, price, 'Product price updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggles active status of a product price
 */
export const updateProductPriceStatus = async (req, res, next) => {
  try {
    const { is_active, reason } = req.body;
    const userId = req.user?.id || null;
    const price = await priceService.updateProductPriceStatus(req.params.id, is_active, reason, userId);
    return sendSuccess(res, price, 'Product price status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a product price
 */
export const deleteProductPrice = async (req, res, next) => {
  try {
    await priceService.deleteProductPrice(req.params.id);
    return sendSuccess(res, null, 'Product price deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets global product price audit history
 */
export const getProductPriceHistory = async (req, res, next) => {
  try {
    const { history, pagination } = await priceService.getProductPriceHistory(req.query);
    return sendSuccess(res, history, 'Price history retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets audit history for a specific price ID
 */
export const getPriceHistoryByPriceId = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { history, pagination } = await priceService.getPriceHistoryByPriceId(req.params.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return sendSuccess(res, history, 'Price history retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};
