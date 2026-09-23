import * as unitService from './unit.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/units
 * List units with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { units, meta } = await unitService.getUnits(req.query);
    return sendSuccess(res, units, 'Units retrieved successfully', 200, meta);
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
    const unit = await unitService.getUnitById(req.params.id);
    return sendSuccess(res, unit, 'Unit retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/units/code/:companyId/:unitCode
 * Retrieve unit by company ID and code
 */
export const getByCode = async (req, res, next) => {
  try {
    const unit = await unitService.getUnitByCode(
      req.params.companyId,
      req.params.unitCode
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
      }
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
    const unit = await unitService.createUnit(data);
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
    const unit = await unitService.updateUnit(req.params.id, data);
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
      updatedBy
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
    const result = await unitService.deleteUnit(req.params.id);
    return sendSuccess(res, result, 'Unit deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/units/company/:companyId/seed-defaults
 * Seed standard default units
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || null;
    const seeded = await unitService.seedDefaultUnits(
      req.params.companyId,
      createdBy
    );
    return sendCreated(res, seeded, 'Default units seeded successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteUnit,
  seedDefaults,
};
