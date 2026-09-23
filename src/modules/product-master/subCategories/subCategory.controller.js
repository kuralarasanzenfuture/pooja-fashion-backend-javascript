import * as subCategoryService from './subCategory.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/subcategories
 * List subcategories with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { subcategories, meta } = await subCategoryService.getSubcategories(req.query);
    return sendSuccess(res, subcategories, 'Subcategories retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/subcategories/:id
 * Retrieve single subcategory by ID
 */
export const getById = async (req, res, next) => {
  try {
    const subcategory = await subCategoryService.getSubcategoryById(req.params.id);
    return sendSuccess(res, subcategory, 'Subcategory retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/subcategories/code/:companyId/:subcategoryCode
 * Retrieve subcategory by company ID and subcategory code
 */
export const getByCode = async (req, res, next) => {
  try {
    const subcategory = await subCategoryService.getSubcategoryByCode(
      req.params.companyId,
      req.params.subcategoryCode
    );
    return sendSuccess(res, subcategory, 'Subcategory retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/subcategories/category/:categoryId
 * Retrieve all subcategories for a category
 */
export const getByCategoryId = async (req, res, next) => {
  try {
    const subcategories = await subCategoryService.getSubcategoriesByCategoryId(
      req.params.categoryId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      }
    );
    return sendSuccess(res, subcategories, 'Category subcategories retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/subcategories/company/:companyId
 * Retrieve all subcategories for a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const subcategories = await subCategoryService.getSubcategoriesByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      }
    );
    return sendSuccess(res, subcategories, 'Company subcategories retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/subcategories
 * Create new subcategory (supports JSON or multipart/form-data with image)
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const subcategory = await subCategoryService.createSubcategory(
      data,
      req.files,
      req.subcategoryUploadSlug
    );
    return sendCreated(res, subcategory, 'Subcategory created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/subcategories/:id
 * Update existing subcategory
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const subcategory = await subCategoryService.updateSubcategory(
      req.params.id,
      data,
      req.files,
      req.subcategoryUploadSlug
    );
    return sendSuccess(res, subcategory, 'Subcategory updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/subcategories/:id/status
 * Update subcategory active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const subcategory = await subCategoryService.updateSubcategoryStatus(
      req.params.id,
      req.body.is_active,
      updatedBy
    );
    return sendSuccess(res, subcategory, 'Subcategory status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/subcategories/:id/image
 * Upload or replace subcategory image
 */
export const uploadImage = async (req, res, next) => {
  try {
    const subcategory = await subCategoryService.uploadSubcategoryImage(
      req.params.id,
      req.files,
      req.subcategoryUploadSlug
    );
    return sendSuccess(res, subcategory, 'Subcategory image uploaded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/subcategories/:id/image
 * Remove subcategory image
 */
export const deleteImage = async (req, res, next) => {
  try {
    const subcategory = await subCategoryService.deleteSubcategoryImage(req.params.id);
    return sendSuccess(res, subcategory, 'Subcategory image deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/subcategories/:id
 * Delete subcategory by ID
 */
export const deleteSubcategory = async (req, res, next) => {
  try {
    const result = await subCategoryService.deleteSubcategory(req.params.id);
    return sendSuccess(res, result, 'Subcategory deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCode,
  getByCategoryId,
  getByCompanyId,
  create,
  update,
  updateStatus,
  uploadImage,
  deleteImage,
  deleteSubcategory,
};
