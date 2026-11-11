import * as categoryRepository from './category.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toCategoryDTO, toCategoryListDTO } from './category.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { deleteFileByUrl } from '../../../shared/utils/file.js';

const toSlug = (text) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^ws-]/g, '')
    .replace(/[s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const extractUploadedImage = (files, slug) => {
  const result = {};
  if (!files) return result;

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
 * List categories with pagination, filtering, and search.
 * Enforces company multi-tenancy:
 * - SuperAdmin can view all categories across companies, or filter by company_id.
 * - Non-SuperAdmin users are strictly scoped to their assigned company.
 */

/**
 * Helper: Only 'superadmin' and 'admin' users who don't have a fixed company_id
 * are permitted to select any company.
 * Other users who have a company_id are strictly scoped to their assigned company.
 */
export const canUserSelectCompany = (user) => {
  if (!user) return false;
  const role = String(user.roleCode || user.role || '').toUpperCase();
  if (role === 'SUPERADMIN') return true;
  const hasComp = Boolean(user.companyId || user.company_id);
  return role === 'ADMIN' && !hasComp;
};

export const getCategories = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  let companyId = query.company_id || query.companyId || null;
  if (companyId) {
    companyId = Number(companyId);
  }

  // Tenant isolation: only superadmin/admin without company_id can select company
  const canSelect = canUserSelectCompany(user);
  if (!canSelect && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      companyId = Number(userCompId);
    }
  }

  const isActive = query.is_active !== undefined ? query.is_active : null;
  const hasImage = query.has_image || query.hasImage || null;

  const { rows, total } = await categoryRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    hasImage,
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
 * Get single category by primary ID with tenant isolation verification
 */
export const getCategoryById = async (id, user = null) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(category.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view categories for another company');
    }
  }

  return toCategoryDTO(category);
};

/**
 * Get category by company ID and category code
 */
export const getCategoryByCode = async (companyId, categoryCode, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view categories for another company');
    }
  }

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
export const getCategoriesByCompanyId = async (companyId, options = {}, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view categories for another company');
    }
  }

  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await categoryRepository.findByCompanyId(companyId, options);
  return toCategoryListDTO(rows);
};

/**
 * Create a new category with enterprise company multi-tenancy enforcement:
 * - SuperAdmin can create categories for any valid company.
 * - Non-SuperAdmin users can only create categories for their assigned company.
 */
export const createCategory = async (data, files = null, uploadSlug = null, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      data.company_id = Number(userCompId);
    }
  } else if (!data.company_id && (user?.companyId || user?.company_id)) {
    data.company_id = Number(user.companyId || user.company_id);
  }

  if (!data.company_id) {
    throw new BadRequestError('Company ID is required to create a category');
  }

  data.company_id = Number(data.company_id);

  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  // Generate category code if not supplied
  if (!data.category_code || !data.category_code.trim()) {
    data.category_code = generateCategoryCode(data.category_name);
  } else {
    data.category_code = data.category_code.trim().toUpperCase();
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

  if (user?.id) {
    data.created_by = user.id;
  }

  const slug = uploadSlug || toSlug(data.category_name || data.category_code);
  const uploadedFiles = extractUploadedImage(files, slug);
  Object.assign(data, uploadedFiles);

  const created = await categoryRepository.create(data);
  return toCategoryDTO(created);
};

/**
 * Update an existing category with company multi-tenancy verification
 */
export const updateCategory = async (id, data, files = null, uploadSlug = null, user = null) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update categories for another company');
    }
    data.company_id = Number(existing.company_id);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);

  if (data.category_code) {
    data.category_code = data.category_code.trim().toUpperCase();
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

  if (user?.id) {
    data.updated_by = user.id;
  }

  const slug = uploadSlug || toSlug(data.category_name || existing.category_name);
  const uploadedFiles = extractUploadedImage(files, slug);

  if (uploadedFiles.image_url) {
    if (existing.image_url) {
      await deleteFileByUrl(existing.image_url);
    }
    Object.assign(data, uploadedFiles);
  }

  const updated = await categoryRepository.update(id, data);
  return toCategoryDTO(updated);
};

/**
 * Update category active status with tenant isolation
 */
export const updateCategoryStatus = async (id, isActive, updatedBy = null, user = null) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify categories for another company');
    }
  }

  const updated = await categoryRepository.updateStatus(id, isActive, updatedBy);
  return toCategoryDTO(updated);
};

/**
 * Upload or replace category image
 */
export const uploadCategoryImage = async (id, files, uploadSlug = null, user = null) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify categories for another company');
    }
  }

  const slug = uploadSlug || toSlug(existing.category_name);
  const uploadedFiles = extractUploadedImage(files, slug);

  if (!uploadedFiles.image_url) {
    throw new BadRequestError('No image file provided for upload');
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  if (user?.id) {
    uploadedFiles.updated_by = user.id;
  }

  const updated = await categoryRepository.update(id, uploadedFiles);
  return toCategoryDTO(updated);
};

/**
 * Delete category image
 */
export const deleteCategoryImage = async (id, user = null) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify categories for another company');
    }
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  const updated = await categoryRepository.update(id, {
    image_url: null,
    image_key: null,
    updated_by: user?.id || null,
  });

  return toCategoryDTO(updated);
};

/**
 * Delete category by ID (verifying company permission and database references)
 */
export const deleteCategory = async (id, user = null) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Category with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete categories for another company');
    }
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

/**
 * Check whether a category name already exists in the given company scope
 */
export const checkCategoryNameExists = async ({
  categoryName,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const name = (categoryName || '').trim();
  if (!name) {
    throw new BadRequestError('Category name is required');
  }

  let targetCompanyId = companyId ? Number(companyId) : null;
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      targetCompanyId = Number(userCompId);
    }
  } else if (!targetCompanyId && (user?.companyId || user?.company_id)) {
    targetCompanyId = Number(user.companyId || user.company_id);
  }

  if (!targetCompanyId) {
    throw new BadRequestError('Company ID is required to check category name');
  }

  const exists = await categoryRepository.existsByName(
    targetCompanyId,
    name,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    categoryName: name,
    companyId: targetCompanyId,
    message: exists
      ? `Category name '${name}' already exists for this company`
      : 'Category name is available',
  };
};

/**
 * Check whether a category code already exists in the given company scope
 */
export const checkCategoryCodeExists = async ({
  categoryCode,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const code = (categoryCode || '').trim().toUpperCase();
  if (!code) {
    throw new BadRequestError('Category code is required');
  }

  let targetCompanyId = companyId ? Number(companyId) : null;
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      targetCompanyId = Number(userCompId);
    }
  } else if (!targetCompanyId && (user?.companyId || user?.company_id)) {
    targetCompanyId = Number(user.companyId || user.company_id);
  }

  if (!targetCompanyId) {
    throw new BadRequestError('Company ID is required to check category code');
  }

  const exists = await categoryRepository.existsByCode(
    targetCompanyId,
    code,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    categoryCode: code,
    companyId: targetCompanyId,
    message: exists
      ? `Category code '${code}' already exists for this company`
      : 'Category code is available',
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
  checkCategoryNameExists,
  checkCategoryCodeExists,
};
