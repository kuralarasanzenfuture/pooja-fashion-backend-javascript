import * as subCategoryRepository from './subCategory.repository.js';
import * as categoryRepository from '../categories/category.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toSubcategoryDTO, toSubcategoryListDTO } from './subCategory.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { deleteFileByUrl } from '../../../shared/utils/file.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  toSlug,
  extractUploadedImage,
  generateSubcategoryCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  toSlug,
  extractUploadedImage,
  generateSubcategoryCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * List subcategories with pagination, filtering, and search.
 * Enforces company multi-tenancy:
 * - SuperAdmin can view all subcategories across companies, or filter by company_id.
 * - Non-SuperAdmin users are strictly scoped to their assigned company.
 */
export const getSubcategories = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);

  const categoryId =
    query.category_id || query.categoryId ? Number(query.category_id || query.categoryId) : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const hasImage = query.has_image || query.hasImage || null;

  const { rows, total } = await subCategoryRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    categoryId,
    isActive,
    hasImage,
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
 * Get all subcategories for a company without pagination (for dropdowns / selectors)
 * Strictly scopes to token-based user's company_id
 */
export const getAllSubcategories = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const categoryId =
    query.category_id || query.categoryId ? Number(query.category_id || query.categoryId) : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const hasImage = query.has_image || query.hasImage || null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'display_order';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await subCategoryRepository.findAllByCompany(companyId, {
    categoryId,
    isActive,
    hasImage,
    search,
    sortBy,
    sortOrder,
  });

  return toSubcategoryListDTO(rows);
};

/**
 * Get subcategory aggregate statistics for user's company
 */
export const getSubcategoryStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const categoryId =
    query.category_id || query.categoryId ? Number(query.category_id || query.categoryId) : null;
  return subCategoryRepository.getSubcategoryStats(companyId, categoryId);
};

/**
 * Reorder subcategories in bulk
 */
export const reorderSubcategories = async (items = [], user = null, requestContext = null) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Items array is required for reordering');
  }

  const effectiveCompanyId = resolveEffectiveCompanyId(user);
  const updatedIds = await subCategoryRepository.reorderSubcategories(items, effectiveCompanyId);

  await recordAuditLog({
    action: 'REORDER',
    entityType: 'SUBCATEGORY',
    entityId: updatedIds[0] || null,
    entityName: 'Subcategories Reorder',
    companyId: effectiveCompanyId,
    requestContext,
    user,
    metadata: { reorderedCount: updatedIds.length, ids: updatedIds },
  });

  return {
    success: true,
    message: `Successfully reordered ${updatedIds.length} subcategories`,
    updatedCount: updatedIds.length,
    updatedIds,
  };
};

/**
 * Get single subcategory by primary ID with tenant isolation verification
 */
export const getSubcategoryById = async (id, user = null) => {
  const subcategory = await subCategoryRepository.findById(id);
  if (!subcategory) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(subcategory.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view subcategories for another company');
    }
  }

  return toSubcategoryDTO(subcategory);
};

/**
 * Get subcategory by company ID and subcategory code
 */
export const getSubcategoryByCode = async (companyId, subcategoryCode, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view subcategories for another company');
    }
  }

  const subcategory = await subCategoryRepository.findByCode(companyId, subcategoryCode);
  if (!subcategory) {
    throw new NotFoundError(
      `Subcategory with code '${subcategoryCode}' not found for company ${companyId}`
    );
  }
  return toSubcategoryDTO(subcategory);
};

/**
 * Get all subcategories for a category with tenant isolation verification
 */
export const getSubcategoriesByCategoryId = async (categoryId, options = {}, user = null) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError(`Category with ID ${categoryId} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(category.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view subcategories for another company');
    }
  }

  const rows = await subCategoryRepository.findByCategoryId(categoryId, options);
  return toSubcategoryListDTO(rows);
};

/**
 * Get all subcategories for a company
 */
export const getSubcategoriesByCompanyId = async (companyId, options = {}, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view subcategories for another company');
    }
  }

  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await subCategoryRepository.findByCompanyId(companyId, options);
  return toSubcategoryListDTO(rows);
};

/**
 * Create a new subcategory with company derived from parent category:
 * - Automatically fetches parent category and stores its company_id.
 * - Non-SuperAdmin users can only create subcategories under categories belonging to their company.
 */
export const createSubcategory = async (
  data,
  files = null,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
  if (!data.category_id) {
    throw new BadRequestError('Category ID is required to create a subcategory');
  }

  data.category_id = Number(data.category_id);

  // Retrieve parent category to automatically derive its company_id
  const category = await categoryRepository.findById(data.category_id);
  if (!category) {
    throw new NotFoundError(`Category with ID ${data.category_id} not found`);
  }

  const derivedCompanyId = Number(category.company_id);

  // Verify company existence
  const company = await companyRepository.findById(derivedCompanyId);
  if (!company) {
    throw new NotFoundError(
      `Company with ID ${derivedCompanyId} associated with parent category not found`
    );
  }

  // If user is restricted to a company, ensure the parent category belongs to user's company
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && derivedCompanyId !== Number(userCompId)) {
      throw new ForbiddenError(
        'You do not have permission to create subcategories for another company'
      );
    }
  }

  // If client also supplied company_id, ensure it does not conflict with the parent category
  if (data.company_id && Number(data.company_id) !== derivedCompanyId) {
    throw new BadRequestError(
      `Provided company_id (${data.company_id}) does not match parent category company (${derivedCompanyId})`
    );
  }

  // Always store the company_id derived from the parent category
  data.company_id = derivedCompanyId;

  // Generate subcategory code if not supplied
  if (!data.subcategory_code || !data.subcategory_code.trim()) {
    data.subcategory_code = generateSubcategoryCode(data.subcategory_name);
  } else {
    data.subcategory_code = data.subcategory_code.trim().toUpperCase();
  }

  // Ensure code uniqueness per company
  const codeExists = await subCategoryRepository.existsByCode(
    data.company_id,
    data.subcategory_code
  );
  if (codeExists) {
    throw new BadRequestError(
      `Subcategory code '${data.subcategory_code}' already exists for this company`
    );
  }

  // Ensure name uniqueness within parent category
  const nameExists = await subCategoryRepository.existsByName(
    data.category_id,
    data.subcategory_name
  );
  if (nameExists) {
    throw new BadRequestError(
      `Subcategory name '${data.subcategory_name}' already exists in this category`
    );
  }

  if (user?.id) {
    data.created_by = user.id;
  }

  const slug = uploadSlug || toSlug(data.subcategory_name || data.subcategory_code);
  const uploadedFiles = extractUploadedImage(files, slug);
  Object.assign(data, uploadedFiles);

  const created = await subCategoryRepository.create(data);
  const dto = toSubcategoryDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'subcategories',
    entityType: 'SubCategory',
    entityId: created.id,
    entityName: created.subcategory_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Subcategory "${created.subcategory_name}" (Code: ${created.subcategory_code}) created under category ID ${created.category_id}`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing subcategory:
 * - Derives and syncs company_id directly from the parent category if category is changed.
 * - Prevents cross-company tampering and enforces company multi-tenancy.
 */
export const updateSubcategory = async (
  id,
  data,
  files = null,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  // Tenant permission check on existing subcategory
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError(
        'You do not have permission to update subcategories for another company'
      );
    }
  }

  let targetCategoryId = Number(existing.category_id);
  let targetCompanyId = Number(existing.company_id);

  // If category_id is updated, automatically derive company_id from the new parent category
  if (data.category_id && Number(data.category_id) !== Number(existing.category_id)) {
    const newCategory = await categoryRepository.findById(data.category_id);
    if (!newCategory) {
      throw new NotFoundError(`Category with ID ${data.category_id} not found`);
    }

    targetCategoryId = Number(newCategory.id);
    targetCompanyId = Number(newCategory.company_id);

    // If tenant user is attempting to move to a category of another company, reject
    if (!canUserSelectCompany(user) && user) {
      const userCompId = user.companyId || user.company_id;
      if (userCompId && targetCompanyId !== Number(userCompId)) {
        throw new ForbiddenError(
          'You do not have permission to move subcategories to another company'
        );
      }
    }
  } else if (data.company_id && Number(data.company_id) !== targetCompanyId) {
    throw new BadRequestError(
      `Cannot change company directly. Subcategory company is derived from its parent category (${targetCompanyId})`
    );
  }

  // Always enforce the company_id derived from the category
  data.category_id = targetCategoryId;
  data.company_id = targetCompanyId;

  if (data.subcategory_code) {
    data.subcategory_code = data.subcategory_code.trim().toUpperCase();
    const codeExists = await subCategoryRepository.existsByCode(
      targetCompanyId,
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
      targetCategoryId,
      data.subcategory_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Subcategory name '${data.subcategory_name}' already exists in this category`
      );
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
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
  const dto = toSubcategoryDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'subcategories',
    entityType: 'SubCategory',
    entityId: updated.id,
    entityName: updated.subcategory_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Subcategory "${updated.subcategory_name}" updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update subcategory active status with tenant isolation
 */
export const updateSubcategoryStatus = async (
  id,
  isActive,
  updatedBy = null,
  user = null,
  requestContext = null
) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify subcategories for another company');
    }
  }

  const updated = await subCategoryRepository.updateStatus(id, isActive, updatedBy);
  const dto = toSubcategoryDTO(updated);

  await recordAuditLog({
    action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    module: 'subcategories',
    entityType: 'SubCategory',
    entityId: updated.id,
    entityName: updated.subcategory_name,
    companyId: updated.company_id,
    userId: updatedBy || user?.id,
    description: `Subcategory "${updated.subcategory_name}" ${isActive ? 'activated' : 'deactivated'}`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Upload or replace subcategory image
 */
export const uploadSubcategoryImage = async (
  id,
  files,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify subcategories for another company');
    }
  }

  const slug = uploadSlug || toSlug(existing.subcategory_name);
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

  const updated = await subCategoryRepository.update(id, uploadedFiles);
  const dto = toSubcategoryDTO(updated);

  await recordAuditLog({
    action: 'UPLOAD',
    module: 'subcategories',
    entityType: 'SubCategory',
    entityId: updated.id,
    entityName: updated.subcategory_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Image uploaded for subcategory "${updated.subcategory_name}"`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Delete subcategory image
 */
export const deleteSubcategoryImage = async (id, user = null, requestContext = null) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify subcategories for another company');
    }
  }

  if (existing.image_url) {
    await deleteFileByUrl(existing.image_url);
  }

  const updated = await subCategoryRepository.update(id, {
    image_url: null,
    image_key: null,
    updated_by: user?.id || null,
  });
  const dto = toSubcategoryDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'subcategories',
    entityType: 'SubCategory',
    entityId: updated.id,
    entityName: updated.subcategory_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Image removed from subcategory "${updated.subcategory_name}"`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Delete subcategory by ID (verifying company permission and database references)
 */
export const deleteSubcategory = async (id, user = null, requestContext = null) => {
  const existing = await subCategoryRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Subcategory with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete subcategories for another company');
    }
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

  await recordAuditLog({
    action: 'DELETE',
    module: 'subcategories',
    entityType: 'SubCategory',
    entityId: existing.id,
    entityName: existing.subcategory_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Subcategory "${existing.subcategory_name}" (ID: ${id}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return {
    id: Number(id),
    deleted: true,
    message: 'Subcategory deleted successfully',
  };
};

/**
 * Check whether a subcategory name already exists in the given category/company scope
 */
export const checkSubcategoryNameExists = async ({
  subcategoryName,
  categoryId = null,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const name = (subcategoryName || '').trim();
  if (!name) {
    throw new BadRequestError('Subcategory name is required');
  }

  let targetCompanyId = resolveEffectiveCompanyId(user, companyId);

  let targetCategoryId = categoryId ? Number(categoryId) : null;
  let exists = false;
  let message = '';

  if (targetCategoryId) {
    const category = await categoryRepository.findById(targetCategoryId);
    if (!category) {
      throw new NotFoundError(`Category with ID ${targetCategoryId} not found`);
    }

    if (!canUserSelectCompany(user) && user) {
      const userCompId = user.companyId || user.company_id;
      if (userCompId && Number(category.company_id) !== Number(userCompId)) {
        throw new ForbiddenError(
          'You do not have permission to check subcategories for another company'
        );
      }
    }

    exists = await subCategoryRepository.existsByName(
      targetCategoryId,
      name,
      excludeId ? Number(excludeId) : null
    );

    message = exists
      ? `Subcategory name '${name}' already exists in this category`
      : 'Subcategory name is available in this category';
  } else if (targetCompanyId) {
    exists = await subCategoryRepository.existsByNameInCompany(
      targetCompanyId,
      name,
      excludeId ? Number(excludeId) : null
    );

    message = exists
      ? `Subcategory name '${name}' already exists for this company`
      : 'Subcategory name is available for this company';
  } else {
    throw new BadRequestError(
      'Either category_id or company_id is required to check subcategory name'
    );
  }

  return {
    exists,
    subcategoryName: name,
    categoryId: targetCategoryId,
    companyId: targetCompanyId,
    message,
  };
};

/**
 * Check whether a subcategory code already exists in the given company scope
 */
export const checkSubcategoryCodeExists = async ({
  subcategoryCode,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const code = (subcategoryCode || '').trim().toUpperCase();
  if (!code) {
    throw new BadRequestError('Subcategory code is required');
  }

  const targetCompanyId = resolveEffectiveCompanyId(user, companyId);

  if (!targetCompanyId) {
    throw new BadRequestError('Company ID is required to check subcategory code');
  }

  const exists = await subCategoryRepository.existsByCode(
    targetCompanyId,
    code,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    subcategoryCode: code,
    companyId: targetCompanyId,
    message: exists
      ? `Subcategory code '${code}' already exists for this company`
      : 'Subcategory code is available',
  };
};

export default {
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  getSubcategories,
  getAllSubcategories,
  getSubcategoryStats,
  reorderSubcategories,
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
  checkSubcategoryNameExists,
  checkSubcategoryCodeExists,
};
