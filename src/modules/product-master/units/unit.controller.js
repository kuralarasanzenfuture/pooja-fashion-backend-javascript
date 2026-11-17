import * as unitService from './unit.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/units
 * List units with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { units, meta } = await unitService.getUnits(req.query, req.user);
    return sendSuccess(res, units, 'Units retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/units/all
 * List all units without pagination (for dropdowns / selectors)
 * Scoped to token-based user's company_id
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const units = await unitService.getAllUnits(req.query, req.user);
    return sendSuccess(res, units, 'All units retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/units/stats
 * Get unit aggregate statistics for token user's company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await unitService.getUnitStats(req.query, req.user);
    return sendSuccess(res, stats, 'Unit statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/units/:id
 * Retrieve single unit by ID
 */
export const getById = async (req, res, next) => {
  try {
    const unit = await unitService.getUnitById(req.params.id, req.user);
    return sendSuccess(res, unit, 'Unit retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/units/code/:companyId/:unitCode
 * Retrieve unit by company ID and unit code
 */
export const getByCode = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.query.company_id || req.user?.company_id;
    const unit = await unitService.getUnitByCode(
      companyId,
      req.params.unitCode,
      req.user
    );
    return sendSuccess(res, unit, 'Unit retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/units/company/:companyId
 * Retrieve all units for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const units = await unitService.getUnitsByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
    return sendSuccess(res, units, 'Company units retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/units
 * Create new unit
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const unit = await unitService.createUnit(data, req.user, req);
    return sendCreated(res, unit, 'Unit created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/units/:id
 * Update existing unit
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const unit = await unitService.updateUnit(req.params.id, data, req.user, req);
    return sendSuccess(res, unit, 'Unit updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/units/:id/status
 * Update unit active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const unit = await unitService.updateUnitStatus(
      req.params.id,
      req.body.is_active,
      updatedBy,
      req.user,
      req
    );
    return sendSuccess(res, unit, 'Unit status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/units/:id
 * Delete unit by ID
 */
export const deleteUnit = async (req, res, next) => {
  try {
    const result = await unitService.deleteUnit(req.params.id, req.user, req);
    return sendSuccess(res, result, 'Unit deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/units/seed-defaults
 * Seed standard default units for a company
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const companyId = req.body.company_id || req.params.companyId;
    const seeded = await unitService.seedDefaultUnits(companyId, req.user, req);
    return sendCreated(res, seeded, 'Default units seeded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/units/check-name
 * Check whether a unit name already exists for a company
 */
export const checkUnitName = async (req, res, next) => {
  try {
    const name = req.query.name || req.query.unit_name;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await unitService.checkUnitNameExists({
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
 * GET /api/product-master/units/check-code
 * Check whether a unit code already exists for a company
 */
export const checkUnitCode = async (req, res, next) => {
  try {
    const code = req.query.code || req.query.unit_code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await unitService.checkUnitCodeExists({
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
  getAllUnpaginated,
  getStats,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteUnit,
  seedDefaults,
  checkUnitName,
  checkUnitCode,
};
