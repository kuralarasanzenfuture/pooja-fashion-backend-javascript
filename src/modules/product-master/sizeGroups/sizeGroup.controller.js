import * as sizeGroupService from './sizeGroup.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/size-groups
 * List size groups with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { sizeGroups, meta } = await sizeGroupService.getSizeGroups(req.query, req.user);
    return sendSuccess(res, sizeGroups, 'Size groups retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/size-groups/all
 * List all size groups without pagination (for dropdowns / selectors)
 * Scoped to token-based user's company_id
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const sizeGroups = await sizeGroupService.getAllSizeGroups(req.query, req.user);
    return sendSuccess(res, sizeGroups, 'All size groups retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/size-groups/tree
 * List size groups with their nested child sizes
 */
export const getTree = async (req, res, next) => {
  try {
    const tree = await sizeGroupService.getSizeGroupTree(req.query, req.user);
    return sendSuccess(res, tree, 'Size groups tree retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/size-groups/stats
 * Get size group aggregate statistics for token user's company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await sizeGroupService.getSizeGroupStats(req.query, req.user);
    return sendSuccess(res, stats, 'Size group statistics retrieved successfully');
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
    const sizeGroup = await sizeGroupService.getSizeGroupById(req.params.id, req.user);
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
      req.params.sizeGroupCode,
      req.user
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
      },
      req.user
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
    const sizeGroup = await sizeGroupService.createSizeGroup(data, req.user, req);
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
    const sizeGroup = await sizeGroupService.updateSizeGroup(
      req.params.id,
      data,
      req.user,
      req
    );
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
      updatedBy,
      req.user,
      req
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
    const result = await sizeGroupService.deleteSizeGroup(req.params.id, req.user, req);
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
    const seeded = await sizeGroupService.seedDefaultSizeGroups(
      req.params.companyId,
      req.user,
      req
    );
    return sendCreated(res, seeded, 'Default size groups seeded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/size-groups/check-name
 * Check whether a size group name already exists for a company
 */
export const checkSizeGroupName = async (req, res, next) => {
  try {
    const name = req.query.name || req.query.size_group_name;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await sizeGroupService.checkSizeGroupNameExists({
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
 * GET /api/product-master/size-groups/check-code
 * Check whether a size group code already exists for a company
 */
export const checkSizeGroupCode = async (req, res, next) => {
  try {
    const code = req.query.code || req.query.size_group_code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await sizeGroupService.checkSizeGroupCodeExists({
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
  getTree,
  getStats,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteSizeGroup,
  seedDefaults,
  checkSizeGroupName,
  checkSizeGroupCode,
};
