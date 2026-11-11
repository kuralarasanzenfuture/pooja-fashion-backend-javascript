import * as categoryRepository from './category.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toCategoryDTO, toCategoryListDTO } from './category.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { deleteFileByUrl } from '../../../shared/utils/file.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  toSlug,
  extractUploadedImage,
  generateCategoryCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  toSlug,
  extractUploadedImage,
  generateCategoryCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

export const getCategories = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);

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
 * Get all categories for a company without pagination (for dropdowns / selectors)
 * Strictly scopes to token-based user's company_id
 */
export const getAllCategories = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const hasImage = query.has_image || query.hasImage || null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'display_order';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await categoryRepository.findAllByCompany(companyId, {
    isActive,
    hasImage,
    search,
    sortBy,
    sortOrder,
  });

  return toCategoryListDTO(rows);
};

/**
 * Get category hierarchy tree with nested subcategories
 * Scoped to token-based user's company_id
 */
export const getCategoryTree = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const rows = await categoryRepository.findTreeByCompany(companyId, { isActive });
  return toCategoryListDTO(rows);
};

/**
 * Get category statistics summary for user's company
 */
export const getCategoryStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  return categoryRepository.getCategoryStats(companyId);
};

/**
 * Get all subcategories belonging to a specific category
 */
export const getCategorySubcategories = async (categoryId, user = null) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError(`Category with ID ${categoryId} not found`);
  }

  const effectiveCompanyId = resolveEffectiveCompanyId(user);
  if (effectiveCompanyId && Number(category.company_id) !== effectiveCompanyId) {
    throw new ForbiddenError('You do not have permission to view subcategories for another company');
  }

  const rows = await categoryRepository.findSubcategoriesByCategoryId(
    categoryId,
    category.company_id
  );

  return rows.map((s) => ({
    id: Number(s.id),
    companyId: Number(s.company_id),
    company_id: Number(s.company_id),
    companyName: s.company_name || null,
    company_name: s.company_name || null,
    categoryId: Number(s.category_id),
    category_id: Number(s.category_id),
    categoryName: s.category_name || null,
    category_name: s.category_name || null,
    subcategoryCode: s.subcategory_code,
    subcategory_code: s.subcategory_code,
    subcategoryName: s.subcategory_name,
    subcategory_name: s.subcategory_name,
    description: s.description || null,
    imageUrl: s.image_url || null,
    image_url: s.image_url || null,
    imageKey: s.image_key || null,
    image_key: s.image_key || null,
    displayOrder: Number(s.display_order ?? 0),
    display_order: Number(s.display_order ?? 0),
    isActive: Boolean(s.is_active),
    is_active: Boolean(s.is_active),
    createdAt: s.created_at ? new Date(s.created_at).toISOString() : null,
    created_at: s.created_at ? new Date(s.created_at).toISOString() : null,
    updatedAt: s.updated_at ? new Date(s.updated_at).toISOString() : null,
    updated_at: s.updated_at ? new Date(s.updated_at).toISOString() : null,
  }));
};

/**
 * Bulk reorder categories display order
 */
export const reorderCategories = async (items = [], user = null, requestContext = null) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Items array is required for reordering');
  }

  const companyId = resolveEffectiveCompanyId(user);
  const updatedIds = await categoryRepository.reorderCategories(items, companyId);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'categories',
    entityType: 'Category',
    companyId,
    userId: user?.id,
    description: `Reordered display sequence for ${updatedIds.length} categories`,
    changeData: { reorderedIds: updatedIds },
    requestContext,
  });

  return {
    reordered: true,
    count: updatedIds.length,
    ids: updatedIds,
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
export const createCategory = async (
  data,
  files = null,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
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
  const dto = toCategoryDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'categories',
    entityType: 'Category',
    entityId: created.id,
    entityName: created.category_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Category "${created.category_name}" (Code: ${created.category_code}) created`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing category with company multi-tenancy verification
 */
export const updateCategory = async (
  id,
  data,
  files = null,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
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
  const dto = toCategoryDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'categories',
    entityType: 'Category',
    entityId: updated.id,
    entityName: updated.category_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Category "${updated.category_name}" updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update category active status with tenant isolation
 */
export const updateCategoryStatus = async (
  id,
  isActive,
  updatedBy = null,
  user = null,
  requestContext = null
) => {
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
  const dto = toCategoryDTO(updated);

  await recordAuditLog({
    action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    module: 'categories',
    entityType: 'Category',
    entityId: updated.id,
    entityName: updated.category_name,
    companyId: updated.company_id,
    userId: updatedBy || user?.id,
    description: `Category "${updated.category_name}" ${isActive ? 'activated' : 'deactivated'}`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Upload or replace category image
 */
export const uploadCategoryImage = async (
  id,
  files,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
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
  const dto = toCategoryDTO(updated);

  await recordAuditLog({
    action: 'UPLOAD',
    module: 'categories',
    entityType: 'Category',
    entityId: updated.id,
    entityName: updated.category_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Image uploaded for category "${updated.category_name}"`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Delete category image
 */
export const deleteCategoryImage = async (id, user = null, requestContext = null) => {
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
  const dto = toCategoryDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'categories',
    entityType: 'Category',
    entityId: updated.id,
    entityName: updated.category_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Image removed from category "${updated.category_name}"`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Delete category by ID (verifying company permission and database references)
 */
export const deleteCategory = async (id, user = null, requestContext = null) => {
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

  await recordAuditLog({
    action: 'DELETE',
    module: 'categories',
    entityType: 'Category',
    entityId: existing.id,
    entityName: existing.category_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Category "${existing.category_name}" (ID: ${id}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

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
  getAllCategories,
  getCategoryTree,
  getCategoryStats,
  getCategorySubcategories,
  reorderCategories,
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
  resolveEffectiveCompanyId,
  canUserSelectCompany,
};
