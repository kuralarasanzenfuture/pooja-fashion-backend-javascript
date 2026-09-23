import * as subCategoryRepository from './subCategory.repository.js';
import * as categoryRepository from '../categories/category.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toSubcategoryDTO, toSubcategoryListDTO } from './subCategory.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { toSlug, deleteFileByUrl } from '../../../shared/utils/file.js';

/**
 * Extract uploaded image URL from req.files dictionary
 */
export const extractUploadedImage = (files, subcategorySlug) => {
  const result = {};
  if (!files) return result;

  const slug = subcategorySlug || 'subcategory';

  if (files.image && files.image[0]) {
    result.image_url = `/uploads/subcategories/${slug}/${files.image[0].filename}`;
    result.image_key = `subcategories/${slug}/${files.image[0].filename}`;
  } else if (files.image_url && files.image_url[0]) {
    result.image_url = `/uploads/subcategories/${slug}/${files.image_url[0].filename}`;
    result.image_key = `subcategories/${slug}/${files.image_url[0].filename}`;
  }

  return result;
};

/**
 * Generate fallback subcategory code from name if omitted
 */
export const generateSubcategoryCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * List subcategories with pagination, filtering, and search
 */
export const getSubcategories = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const categoryId = query.category_id || query.categoryId || null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await subCategoryRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    categoryId,
    isActive,
    sortBy: sortBy || 'display_order',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    subcategories: toSubcategoryListDTO(rows),
    meta,
  };
};

/**
 * Get single subcategory by primary ID
 */
export const getSubcategoryById = async (id) => {
  const subcategory = await subCategoryRepository.findById(id);
  if (!subcategory) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }
  return toSubcategoryDTO(subcategory);
};

/**
 * Get subcategory by company ID and subcategory code
 */
export const getSubcategoryByCode = async (companyId, subcategoryCode) => {
  const subcategory = await subCategoryRepository.findByCode(companyId, subcategoryCode);
  if (!subcategory) {
    throw new NotFoundError(
      `Subcategory with code '${subcategoryCode}' not found for company ${companyId}`
    );
  }
  return toSubcategoryDTO(subcategory);
};

/**
 * Get all subcategories for a category
 */
export const getSubcategoriesByCategoryId = async (categoryId, options = {}) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError(`Category with ID ${categoryId} not found`);
  }

  const rows = await subCategoryRepository.findByCategoryId(categoryId, options);
  return toSubcategoryListDTO(rows);
};

/**
 * Get all subcategories for a company
 */
export const getSubcategoriesByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await subCategoryRepository.findByCompanyId(companyId, options);
  return toSubcategoryListDTO(rows);
};

/**
 * Create a new subcategory
 */
export const createSubcategory = async (data, files = null, uploadSlug = null) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  const category = await categoryRepository.findById(data.category_id);
  if (!category) {
    throw new NotFoundError(`Category with ID ${data.category_id} not found`);
  }

  if (Number(category.company_id) !== Number(data.company_id)) {
    throw new BadRequestError(
      `Category ${data.category_id} does not belong to company ${data.company_id}`
    );
  }

  if (!data.subcategory_code) {
    data.subcategory_code = generateSubcategoryCode(data.subcategory_name);
  }

  const codeExists = await subCategoryRepository.existsByCode(
    data.company_id,
    data.subcategory_code
  );
  if (codeExists) {
    throw new BadRequestError(
      `Subcategory code '${data.subcategory_code}' already exists for this company`
    );
  }

  const nameExists = await subCategoryRepository.existsByName(
    data.category_id,
    data.subcategory_name
  );
  if (nameExists) {
    throw new BadRequestError(
      `Subcategory name '${data.subcategory_name}' already exists in this category`
    );
  }

  const slug = uploadSlug || toSlug(data.subcategory_name || data.subcategory_code);
  const uploadedFiles = extractUploadedImage(files, slug);
  Object.assign(data, uploadedFiles);

  const created = await subCategoryRepository.create(data);
  return toSubcategoryDTO(created);
};

/**
 * Update an existing subcategory
 */
export const updateSubcategory = async (id, data, files = null, uploadSlug = null) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  const companyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);
  const categoryId = data.category_id ? Number(data.category_id) : Number(existing.category_id);

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  if (data.category_id && Number(data.category_id) !== Number(existing.category_id)) {
    const targetCategory = await categoryRepository.findById(data.category_id);
    if (!targetCategory) {
      throw new NotFoundError(`Category with ID ${data.category_id} not found`);
    }
    if (Number(targetCategory.company_id) !== companyId) {
      throw new BadRequestError(
        `Category ${data.category_id} does not belong to company ${companyId}`
      );
    }
  }

  if (data.subcategory_code) {
    const codeExists = await subCategoryRepository.existsByCode(
      companyId,
      data.subcategory_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Subcategory code '${data.subcategory_code}' already exists for this company`
      );
    }
  }

  if (data.subcategory_name) {
    const nameExists = await subCategoryRepository.existsByName(
      categoryId,
      data.subcategory_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Subcategory name '${data.subcategory_name}' already exists in this category`
      );
    }
  }

  const slug = uploadSlug || toSlug(data.subcategory_name || existing.subcategory_name);
  const uploadedFiles = extractUploadedImage(files, slug);

  if (uploadedFiles.image_url) {
    if (existing.image_url) {
      await deleteFileByUrl(existing.image_url);
    }
    Object.assign(data, uploadedFiles);
  }

  const updated = await subCategoryRepository.update(id, data);
  return toSubcategoryDTO(updated);
};

/**
 * Update subcategory active status
 */
export const updateSubcategoryStatus = async (id, isActive, updatedBy = null) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  const updated = await subCategoryRepository.updateStatus(id, isActive, updatedBy);
  return toSubcategoryDTO(updated);
};

/**
 * Upload or replace subcategory image
 */
export const uploadSubcategoryImage = async (id, files, uploadSlug = null) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  const slug = uploadSlug || toSlug(existing.subcategory_name);
  const uploadedFiles = extractUploadedImage(files, slug);

  if (!uploadedFiles.image_url) {
    throw new BadRequestError('No image file provided for upload');
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  const updated = await subCategoryRepository.update(id, uploadedFiles);
  return toSubcategoryDTO(updated);
};

/**
 * Delete subcategory image
 */
export const deleteSubcategoryImage = async (id) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  const updated = await subCategoryRepository.update(id, {
    image_url: null,
    image_key: null,
  });

  return toSubcategoryDTO(updated);
};

/**
 * Delete subcategory by ID
 */
export const deleteSubcategory = async (id) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  const productCount = await subCategoryRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(
      `Cannot delete subcategory '${existing.subcategory_name}' because it is assigned to ${productCount} products`
    );
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  await subCategoryRepository.deleteById(id);

  return {
    id: Number(id),
    deleted: true,
    message: 'Subcategory deleted successfully',
  };
};

export default {
  getSubcategories,
  getSubcategoryById,
  getSubcategoryByCode,
  getSubcategoriesByCategoryId,
  getSubcategoriesByCompanyId,
  createSubcategory,
  updateSubcategory,
  updateSubcategoryStatus,
  uploadSubcategoryImage,
  deleteSubcategoryImage,
  deleteSubcategory,
};
