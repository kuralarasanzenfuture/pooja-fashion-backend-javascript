import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';
import * as discountService from './discount.service.js';

/**
 * Creates a new discount campaign
 */
export const createDiscount = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const discount = await discountService.createDiscount(req.body, userId);
    return sendCreated(res, discount, 'Discount created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets discounts with filters and pagination
 */
export const getDiscounts = async (req, res, next) => {
  try {
    const { discounts, pagination } = await discountService.getDiscounts(req.query);
    return sendSuccess(res, discounts, 'Discounts retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a single discount by ID
 */
export const getDiscountById = async (req, res, next) => {
  try {
    const discount = await discountService.getDiscountById(req.params.id);
    return sendSuccess(res, discount, 'Discount retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing discount
 */
export const updateDiscount = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const discount = await discountService.updateDiscount(req.params.id, req.body, userId);
    return sendSuccess(res, discount, 'Discount updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggles active status of a discount
 */
export const updateDiscountStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { is_active } = req.body;
    const discount = await discountService.updateDiscountStatus(req.params.id, is_active, userId);
    return sendSuccess(res, discount, 'Discount status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a discount record
 */
export const deleteDiscount = async (req, res, next) => {
  try {
    await discountService.deleteDiscount(req.params.id);
    return sendSuccess(res, null, 'Discount deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Seeds standard promotional discount templates for a company
 */
export const seedStandardDiscounts = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { companyId } = req.params;
    const result = await discountService.seedStandardDiscounts(companyId, userId);
    return sendSuccess(res, result, 'Standard promotional discounts seeded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Calculates discount deductions and savings for checkout
 */
export const calculateDiscount = async (req, res, next) => {
  try {
    const result = await discountService.calculateDiscount(req.body);
    return sendSuccess(res, result, 'Discount calculated successfully');
  } catch (error) {
    next(error);
  }
};
