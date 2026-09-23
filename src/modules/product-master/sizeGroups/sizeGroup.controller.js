import * as sizeGroupService from './sizeGroup.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/size-groups
 * List size groups with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { sizeGroups, meta } = await sizeGroupService.getSizeGroups(req.query);
    return sendSuccess(res, sizeGroups, 'Size groups retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/size-groups/:id
 * Retrieve single size group by ID
 */
export const getById = async (req, res, next) => {
  try {
    const sizeGroup = await sizeGroupService.getSizeGroupById(req.params.id);
    return sendSuccess(res, sizeGroup, 'Size group retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/size-groups/code/:companyId/:sizeGroupCode
 * Retrieve size group by company ID and code
 */
export const getByCode = async (req, res, next) => {
  try {
    const sizeGroup = await sizeGroupService.getSizeGroupByCode(
      req.params.companyId,
      req.params.sizeGroupCode
    );
    return sendSuccess(res, sizeGroup, 'Size group retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/size-groups/company/:companyId
 * Retrieve all size groups for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const sizeGroups = await sizeGroupService.getSizeGroupsByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      }
    );
    return sendSuccess(res, sizeGroups, 'Company size groups retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/size-groups
 * Create new size group
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const sizeGroup = await sizeGroupService.createSizeGroup(data);
    return sendCreated(res, sizeGroup, 'Size group created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/size-groups/:id
 * Update existing size group
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const sizeGroup = await sizeGroupService.updateSizeGroup(req.params.id, data);
    return sendSuccess(res, sizeGroup, 'Size group updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/size-groups/:id/status
 * Update size group active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const sizeGroup = await sizeGroupService.updateSizeGroupStatus(
      req.params.id,
      req.body.is_active,
      updatedBy
    );
    return sendSuccess(res, sizeGroup, 'Size group status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/size-groups/:id
 * Delete size group by ID
 */
export const deleteSizeGroup = async (req, res, next) => {
  try {
    const result = await sizeGroupService.deleteSizeGroup(req.params.id);
    return sendSuccess(res, result, 'Size group deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/size-groups/company/:companyId/seed-defaults
 * Seed standard default size groups
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || null;
    const seeded = await sizeGroupService.seedDefaultSizeGroups(
      req.params.companyId,
      createdBy
    );
    return sendCreated(res, seeded, 'Default size groups seeded successfully');
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
  deleteSizeGroup,
  seedDefaults,
};
