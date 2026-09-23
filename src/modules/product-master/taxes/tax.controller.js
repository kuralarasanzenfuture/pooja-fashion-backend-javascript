import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';
import * as taxService from './tax.service.js';

/**
 * Creates a new tax record
 */
export const createTax = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const tax = await taxService.createTax(req.body, userId);
    return sendCreated(res, tax, 'Tax created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Gets taxes with filters and pagination
 */
export const getTaxes = async (req, res, next) => {
  try {
    const { taxes, pagination } = await taxService.getTaxes(req.query);
    return sendSuccess(res, taxes, 'Taxes retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a single tax by ID
 */
export const getTaxById = async (req, res, next) => {
  try {
    const tax = await taxService.getTaxById(req.params.id);
    return sendSuccess(res, tax, 'Tax retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing tax
 */
export const updateTax = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const tax = await taxService.updateTax(req.params.id, req.body, userId);
    return sendSuccess(res, tax, 'Tax updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggles active status of a tax
 */
export const updateTaxStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { is_active } = req.body;
    const tax = await taxService.updateTaxStatus(req.params.id, is_active, userId);
    return sendSuccess(res, tax, 'Tax status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a tax record
 */
export const deleteTax = async (req, res, next) => {
  try {
    await taxService.deleteTax(req.params.id);
    return sendSuccess(res, null, 'Tax deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Seeds standard Indian GST slabs for a company
 */
export const seedDefaultTaxes = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { companyId } = req.params;
    const result = await taxService.seedDefaultTaxes(companyId, userId);
    return sendSuccess(res, result, 'Default GST taxes seeded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Real-time POS tax breakdown calculation
 */
export const calculateTax = async (req, res, next) => {
  try {
    const result = await taxService.calculateTaxBreakdown(req.body);
    return sendSuccess(res, result, 'Tax calculation completed successfully');
  } catch (error) {
    next(error);
  }
};
