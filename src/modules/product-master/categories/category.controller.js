import * as categoryService from './category.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/product-master/categories
 * List categories with pagination & filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { categories, meta } = await categoryService.getCategories(req.query, req.user);
    return sendSuccess(res, categories, 'Categories retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/categories/all
 * List all categories without pagination (for dropdowns / selectors)
 * Scoped to token-based user's company_id
 */
export const getAllUnpaginated = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(req.query, req.user);
    return sendSuccess(res, categories, 'All categories retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/categories/tree
 * List categories with nested subcategories hierarchy
 * Scoped to token-based user's company_id
 */
export const getTree = async (req, res, next) => {
  try {
    const tree = await categoryService.getCategoryTree(req.query, req.user);
    return sendSuccess(res, tree, 'Category tree retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/categories/stats
 * Get categories aggregate statistics for token user's company
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await categoryService.getCategoryStats(req.query, req.user);
    return sendSuccess(res, stats, 'Category statistics retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/categories/:id/subcategories
 * Retrieve all subcategories under a specific category ID
 */
export const getSubcategories = async (req, res, next) => {
  try {
    const subcategories = await categoryService.getCategorySubcategories(req.params.id, req.user);
    return sendSuccess(res, subcategories, 'Category subcategories retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/product-master/categories/reorder
 * Bulk reorder display sequence of categories
 */
export const reorder = async (req, res, next) => {
  try {
    const result = await categoryService.reorderCategories(req.body.items, req.user, req);
    return sendSuccess(res, result, 'Categories reordered successfully');
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
    const category = await categoryService.getCategoryById(req.params.id, req.user);
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
      req.params.categoryCode,
      req.user
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
    const categories = await categoryService.getCategoriesByCompanyId(
      req.params.companyId,
      {
        isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : null,
      },
      req.user
    );
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
      req.categoryUploadSlug,
      req.user,
      req
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
      req.categoryUploadSlug,
      req.user,
      req
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
      updatedBy,
      req.user,
      req
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
      req.categoryUploadSlug,
      req.user,
      req
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
    const category = await categoryService.deleteCategoryImage(req.params.id, req.user, req);
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
    const result = await categoryService.deleteCategory(req.params.id, req.user, req);
    return sendSuccess(res, result, 'Category deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/product-master/categories/check-name
 * Check whether a category name already exists for a company
 */
export const checkCategoryName = async (req, res, next) => {
  try {
    const categoryName = req.query.category_name || req.query.name;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await categoryService.checkCategoryNameExists({
      categoryName,
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
 * GET /api/product-master/categories/check-code
 * Check whether a category code already exists for a company
 */
export const checkCategoryCode = async (req, res, next) => {
  try {
    const categoryCode = req.query.category_code || req.query.code;
    const companyId = req.query.company_id || req.query.companyId;
    const excludeId = req.query.exclude_id || req.query.excludeId;

    const result = await categoryService.checkCategoryCodeExists({
      categoryCode,
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
  getSubcategories,
  reorder,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  uploadImage,
  deleteImage,
  deleteCategory,
  checkCategoryName,
  checkCategoryCode,
};
