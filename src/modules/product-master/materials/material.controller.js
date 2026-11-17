import * as materialService from './material.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/materials
 * List materials with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { materials, meta } = await materialService.getMaterials(req.query, req.user);
    return sendSuccess(res, materials, 'Materials retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/materials/all
 * List all materials without pagination (for dropdowns / selectors)
 * Scoped to token-based user's company_id
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const materials = await materialService.getAllMaterials(req.query, req.user);
    return sendSuccess(res, materials, 'All materials retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/materials/stats
 * Get material aggregate statistics for token user's company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await materialService.getMaterialStats(req.query, req.user);
    return sendSuccess(res, stats, 'Material statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/materials/:id
 * Retrieve single material by ID
 */
export const getById = async (req, res, next) => {
  try {
    const material = await materialService.getMaterialById(req.params.id, req.user);
    return sendSuccess(res, material, 'Material retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/materials/code/:companyId/:materialCode
 * Retrieve material by company ID and material code
 */
export const getByCode = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.query.company_id || req.user?.company_id;
    const material = await materialService.getMaterialByCode(
      companyId,
      req.params.materialCode,
      req.user
    );
    return sendSuccess(res, material, 'Material retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/materials/company/:companyId
 * Retrieve all materials for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const materials = await materialService.getMaterialsByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
    return sendSuccess(res, materials, 'Company materials retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/materials
 * Create new material
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const material = await materialService.createMaterial(data, req.user, req);
    return sendCreated(res, material, 'Material created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/materials/:id
 * Update existing material
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const material = await materialService.updateMaterial(req.params.id, data, req.user, req);
    return sendSuccess(res, material, 'Material updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/materials/:id/status
 * Update material active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const material = await materialService.updateMaterialStatus(
      req.params.id,
      req.body.is_active,
      updatedBy,
      req.user,
      req
    );
    return sendSuccess(res, material, 'Material status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/materials/:id
 * Delete material by ID
 */
export const deleteMaterial = async (req, res, next) => {
  try {
    const result = await materialService.deleteMaterial(req.params.id, req.user, req);
    return sendSuccess(res, result, 'Material deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/materials/seed-defaults
 * Seed standard default materials for a company
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const companyId = req.body.company_id || req.params.companyId;
    const seeded = await materialService.seedDefaultMaterials(companyId, req.user, req);
    return sendCreated(res, seeded, 'Default materials seeded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/materials/check-name
 * Check whether a material name already exists for a company
 */
export const checkMaterialName = async (req, res, next) => {
  try {
    const name = req.query.name || req.query.material_name;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await materialService.checkMaterialNameExists({
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
 * GET /api/product-master/materials/check-code
 * Check whether a material code already exists for a company
 */
export const checkMaterialCode = async (req, res, next) => {
  try {
    const code = req.query.code || req.query.material_code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await materialService.checkMaterialCodeExists({
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
  deleteMaterial,
  seedDefaults,
  checkMaterialName,
  checkMaterialCode,
};
