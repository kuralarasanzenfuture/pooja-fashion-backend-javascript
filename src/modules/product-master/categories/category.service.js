import * as categoryRepository from './category.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toCategoryDTO, toCategoryListDTO } from './category.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { toSlug, deleteFileByUrl } from '../../../shared/utils/file.js';

/**
 * Extract uploaded image URL from req.files dictionary
 */
export const extractUploadedImage = (files, categorySlug) => {
  const result = {};
  if (!files) return result;

  const slug = categorySlug || 'category';

  if (files.image && files.image[0]) {
    result.image_url = `/uploads/categories/${slug}/${files.image[0].filename}`;
    result.image_key = `categories/${slug}/${files.image[0].filename}`;
  } else if (files.image_url && files.image_url[0]) {
    result.image_url = `/uploads/categories/${slug}/${files.image_url[0].filename}`;
    result.image_key = `categories/${slug}/${files.image_url[0].filename}`;
  }

  return result;
};

/**
 * Generate fallback category code from name if omitted
 */
export const generateCategoryCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * List categories with pagination, filtering, and search
 */
export const getCategories = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await categoryRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    sortBy: sortBy || 'display_order',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    categories: toCategoryListDTO(rows),
    meta,
  };
};

/**
 * Get single category by primary ID
 */
export const getCategoryById = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }
  return toCategoryDTO(category);
};

/**
 * Get category by company ID and category code
 */
export const getCategoryByCode = async (companyId, categoryCode) => {
  const category = await categoryRepository.findByCode(companyId, categoryCode);
  if (!category) {
    throw new NotFoundError(
      `Category with code '${categoryCode}' not found for company ${companyId}`
    );
  }
  return toCategoryDTO(category);
};

/**
 * Get all categories for a company
 */
export const getCategoriesByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await categoryRepository.findByCompanyId(companyId, options);
  return toCategoryListDTO(rows);
};

/**
 * Create a new category
 */
export const createCategory = async (data, files = null, uploadSlug = null) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  // Generate category code if not supplied
  if (!data.category_code) {
    data.category_code = generateCategoryCode(data.category_name);
  }

  // Ensure code uniqueness per company
  const codeExists = await categoryRepository.existsByCode(data.company_id, data.category_code);
  if (codeExists) {
    throw new BadRequestError(
      `Category code '${data.category_code}' already exists for this company`
    );
  }

  // Ensure name uniqueness per company
  const nameExists = await categoryRepository.existsByName(data.company_id, data.category_name);
  if (nameExists) {
    throw new BadRequestError(
      `Category name '${data.category_name}' already exists for this company`
    );
  }

  const slug = uploadSlug || toSlug(data.category_name || data.category_code);
  const uploadedFiles = extractUploadedImage(files, slug);
  Object.assign(data, uploadedFiles);

  const created = await categoryRepository.create(data);
  return toCategoryDTO(created);
};

/**
 * Update an existing category
 */
export const updateCategory = async (id, data, files = null, uploadSlug = null) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id || existing.company_id;

  if (data.category_code) {
    const codeExists = await categoryRepository.existsByCode(
      companyId,
      data.category_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Category code '${data.category_code}' already exists for this company`
      );
    }
  }

  if (data.category_name) {
    const nameExists = await categoryRepository.existsByName(
      companyId,
      data.category_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Category name '${data.category_name}' already exists for this company`
      );
    }
  }

  const slug = uploadSlug || toSlug(data.category_name || existing.category_name);
  const uploadedFiles = extractUploadedImage(files, slug);

  if (uploadedFiles.image_url) {
    // Delete old image if new one is uploaded
    if (existing.image_url) {
      await deleteFileByUrl(existing.image_url);
    }
    Object.assign(data, uploadedFiles);
  }

  const updated = await categoryRepository.update(id, data);
  return toCategoryDTO(updated);
};

/**
 * Update category active status
 */
export const updateCategoryStatus = async (id, isActive, updatedBy = null) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  const updated = await categoryRepository.updateStatus(id, isActive, updatedBy);
  return toCategoryDTO(updated);
};

/**
 * Upload or replace category image
 */
export const uploadCategoryImage = async (id, files, uploadSlug = null) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  const slug = uploadSlug || toSlug(existing.category_name);
  const uploadedFiles = extractUploadedImage(files, slug);

  if (!uploadedFiles.image_url) {
    throw new BadRequestError('No image file provided for upload');
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  const updated = await categoryRepository.update(id, uploadedFiles);
  return toCategoryDTO(updated);
};

/**
 * Delete category image
 */
export const deleteCategoryImage = async (id) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  const updated = await categoryRepository.update(id, {
    image_url: null,
    image_key: null,
  });

  return toCategoryDTO(updated);
};

/**
 * Delete category by ID (verifying references)
 */
export const deleteCategory = async (id) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  const subcategoryCount = await categoryRepository.countSubcategories(id);
  if (subcategoryCount > 0) {
    throw new BadRequestError(
      `Cannot delete category '${existing.category_name}' because it has ${subcategoryCount} subcategories attached`
    );
  }

  const productCount = await categoryRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(
      `Cannot delete category '${existing.category_name}' because it is assigned to ${productCount} products`
    );
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  await categoryRepository.deleteById(id);

  return {
    id: Number(id),
    deleted: true,
    message: 'Category deleted successfully',
  };
};

export default {
  getCategories,
  getCategoryById,
  getCategoryByCode,
  getCategoriesByCompanyId,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  uploadCategoryImage,
  deleteCategoryImage,
  deleteCategory,
};
