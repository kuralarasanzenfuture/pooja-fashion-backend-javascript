import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';
import * as taxService from './tax.service.js';

/**
 * GET /api/taxes or /api/product-master/taxes
 * List taxes with filters & pagination
 */
export const getAll = async (req, res, next) => {
  try {
    const { taxes, meta } = await taxService.getTaxes(req.query, req.user);
    return sendSuccess(res, taxes, 'Taxes retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * Alias for getAll
 */
export const getTaxes = getAll;

/**
 * GET /api/taxes/all or /api/product-master/taxes/all
 * List all taxes without pagination (for dropdowns / selectors)
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const taxes = await taxService.getAllTaxes(req.query, req.user);
    return sendSuccess(res, taxes, 'All taxes retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/taxes/stats or /api/product-master/taxes/stats
 * Get tax statistics for user company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await taxService.getTaxStats(req.query, req.user);
    return sendSuccess(res, stats, 'Tax statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/taxes/:id or /api/product-master/taxes/:id
 * Retrieve single tax by ID
 */
export const getById = async (req, res, next) => {
  try {
    const tax = await taxService.getTaxById(req.params.id, req.user);
    return sendSuccess(res, tax, 'Tax retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * Alias for getById
 */
export const getTaxById = getById;

/**
 * GET /api/taxes/code/:companyId/:taxCode
 * Retrieve tax by company ID and tax code
 */
export const getByCode = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.query.company_id || req.user?.company_id;
    const tax = await taxService.getTaxByCode(companyId, req.params.taxCode, req.user);
    return sendSuccess(res, tax, 'Tax retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/taxes/company/:companyId
 * Retrieve all taxes for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const taxes = await taxService.getTaxesByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
    return sendSuccess(res, taxes, 'Company taxes retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/taxes or /api/product-master/taxes
 * Create a new tax record
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const tax = await taxService.createTax(data, req.user, req);
    return sendCreated(res, tax, 'Tax created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * Alias for create
 */
export const createTax = create;

/**
 * PUT /api/taxes/:id or /api/product-master/taxes/:id
 * Update an existing tax
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const tax = await taxService.updateTax(req.params.id, data, req.user, req);
    return sendSuccess(res, tax, 'Tax updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * Alias for update
 */
export const updateTax = update;

/**
 * PATCH /api/taxes/:id/status or /api/product-master/taxes/:id/status
 * Toggle active status of a tax
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const tax = await taxService.updateTaxStatus(req.params.id, is_active, req.user, req);
    return sendSuccess(res, tax, 'Tax status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * Alias for updateStatus
 */
export const updateTaxStatus = updateStatus;

/**
 * DELETE /api/taxes/:id or /api/product-master/taxes/:id
 * Delete a tax record
 */
export const deleteTax = async (req, res, next) => {
  try {
    await taxService.deleteTax(req.params.id, req.user, req);
    return sendSuccess(res, null, 'Tax deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/taxes/seed-defaults or /api/taxes/seed/:companyId
 * Seed standard Indian GST slabs for a company
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const companyId = req.body?.company_id || req.params?.companyId || req.user?.company_id;
    const result = await taxService.seedDefaultTaxes(companyId, req.user, req);
    return sendCreated(res, result, 'Default GST taxes seeded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * Alias for seedDefaults
 */
export const seedDefaultTaxes = seedDefaults;

/**
 * POST /api/taxes/calculate or /api/product-master/taxes/calculate
 * Real-time POS tax breakdown calculation
 */
export const calculateTax = async (req, res, next) => {
  try {
    const result = await taxService.calculateTaxBreakdown(req.body);
    return sendSuccess(res, result, 'Tax calculation completed successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/taxes/check-name or /api/product-master/taxes/check-name
 * Check whether a tax name already exists for a company
 */
export const checkTaxName = async (req, res, next) => {
  try {
    const name = req.query.name || req.query.tax_name;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await taxService.checkTaxNameExists({
      name,
      companyId,
      excludeId,
      user: req.user,
    });

    return sendSuccess(res, result, result.message);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/taxes/check-code or /api/product-master/taxes/check-code
 * Check whether a tax code already exists for a company
 */
export const checkTaxCode = async (req, res, next) => {
  try {
    const code = req.query.code || req.query.tax_code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await taxService.checkTaxCodeExists({
      code,
      companyId,
      excludeId,
      user: req.user,
    });

    return sendSuccess(res, result, result.message);
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getTaxes,
  getAllUnpaginated,
  getStats,
  getById,
  getTaxById,
  getByCode,
  getByCompanyId,
  create,
  createTax,
  update,
  updateTax,
  updateStatus,
  updateTaxStatus,
  deleteTax,
  seedDefaults,
  seedDefaultTaxes,
  calculateTax,
  checkTaxName,
  checkTaxCode,
};
