import * as categoryService from './category.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/categories
 * List categories with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { categories, meta } = await categoryService.getCategories(req.query);
    return sendSuccess(res, categories, 'Categories retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/categories/:id
 * Retrieve category by primary ID
 */
export const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/categories/code/:companyId/:categoryCode
 * Retrieve category by company ID and category code
 */
export const getByCode = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryByCode(
      req.params.companyId,
      req.params.categoryCode
    );
    return sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/categories/company/:companyId
 * Retrieve all categories belonging to a company
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategoriesByCompanyId(req.params.companyId, {
      isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
    });
    return sendSuccess(res, categories, 'Company categories retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/categories
 * Create new category (supports JSON or multipart/form-data with image)
 */
export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user?.id || req.body.created_by,
    };
    const category = await categoryService.createCategory(
      data,
      req.files,
      req.categoryUploadSlug
    );
    return sendCreated(res, category, 'Category created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/product-master/categories/:id
 * Update existing category
 */
export const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updated_by: req.user?.id || req.body.updated_by,
    };
    const category = await categoryService.updateCategory(
      req.params.id,
      data,
      req.files,
      req.categoryUploadSlug
    );
    return sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/categories/:id/status
 * Update category active status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const category = await categoryService.updateCategoryStatus(
      req.params.id,
      req.body.is_active,
      updatedBy
    );
    return sendSuccess(res, category, 'Category status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/product-master/categories/:id/image
 * Upload or replace category image
 */
export const uploadImage = async (req, res, next) => {
  try {
    const category = await categoryService.uploadCategoryImage(
      req.params.id,
      req.files,
      req.categoryUploadSlug
    );
    return sendSuccess(res, category, 'Category image uploaded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/categories/:id/image
 * Remove category image
 */
export const deleteImage = async (req, res, next) => {
  try {
    const category = await categoryService.deleteCategoryImage(req.params.id);
    return sendSuccess(res, category, 'Category image deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/product-master/categories/:id
 * Delete category by ID
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return sendSuccess(res, result, 'Category deleted successfully');
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
  uploadImage,
  deleteImage,
  deleteCategory,
};
