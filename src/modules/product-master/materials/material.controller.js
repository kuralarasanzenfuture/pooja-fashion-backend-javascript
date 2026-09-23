import * as materialService from './material.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/materials
 * List materials with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { materials, meta } = await materialService.getMaterials(req.query);
    return sendSuccess(res, materials, 'Materials retrieved successfully', 200, meta);
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
    const material = await materialService.getMaterialById(req.params.id);
    return sendSuccess(res, material, 'Material retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/materials/code/:companyId/:materialCode
 * Retrieve material by company ID and code
 */
export const getByCode = async (req, res, next) => {
  try {
    const material = await materialService.getMaterialByCode(
      req.params.companyId,
      req.params.materialCode
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
      }
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
    const material = await materialService.createMaterial(data);
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
    const material = await materialService.updateMaterial(req.params.id, data);
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
      updatedBy
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
    const result = await materialService.deleteMaterial(req.params.id);
    return sendSuccess(res, result, 'Material deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/materials/company/:companyId/seed-defaults
 * Seed standard default materials
 */
export const seedDefaults = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || null;
    const seeded = await materialService.seedDefaultMaterials(
      req.params.companyId,
      createdBy
    );
    return sendCreated(res, seeded, 'Default materials seeded successfully');
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
  deleteMaterial,
  seedDefaults,
};
