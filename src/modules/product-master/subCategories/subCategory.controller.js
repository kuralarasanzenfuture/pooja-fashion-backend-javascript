import * as subCategoryService from './subCategory.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/subcategories
 * List subcategories with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { subcategories, meta } = await subCategoryService.getSubcategories(req.query, req.user);
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
    const subcategory = await subCategoryService.getSubcategoryById(req.params.id, req.user);
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
      req.params.subcategoryCode,
      req.user
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
      },
      req.user
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
      },
      req.user
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
      req.subcategoryUploadSlug,
      req.user
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
      req.subcategoryUploadSlug,
      req.user
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
      updatedBy,
      req.user
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
      req.subcategoryUploadSlug,
      req.user
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
    const subcategory = await subCategoryService.deleteSubcategoryImage(req.params.id, req.user);
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
    const result = await subCategoryService.deleteSubcategory(req.params.id, req.user);
    return sendSuccess(res, result, 'Subcategory deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/subcategories/check-name
 * Check whether a subcategory name already exists in a category or company
 */
export const checkSubcategoryName = async (req, res, next) => {
  try {
    const subcategoryName = req.query.subcategory_name || req.query.name;
    const categoryId = req.query.category_id || req.query.categoryId;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await subCategoryService.checkSubcategoryNameExists({
      subcategoryName,
      categoryId,
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
 * GET /api/product-master/subcategories/check-code
 * Check whether a subcategory code already exists for a company
 */
export const checkSubcategoryCode = async (req, res, next) => {
  try {
    const subcategoryCode = req.query.subcategory_code || req.query.code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await subCategoryService.checkSubcategoryCodeExists({
      subcategoryCode,
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
  checkSubcategoryName,
  checkSubcategoryCode,
};
