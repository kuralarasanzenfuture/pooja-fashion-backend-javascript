import * as subCategoryRepository from './subCategory.repository.js';
import * as categoryRepository from '../categories/category.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toSubcategoryDTO, toSubcategoryListDTO } from './subCategory.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
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
 * Helper: Determine if user is permitted to view or manage resources across any company.
 * - SuperAdmin can view all or filter by any company.
 * - System Admin without an assigned companyId can select any company.
 * - All other users are strictly restricted to their assigned company.
 */
export const canUserSelectCompany = (user) => {
  if (!user) return false;
  const role = String(user.roleCode || user.role || '').toUpperCase();
  if (role === 'SUPERADMIN') return true;
  const hasComp = Boolean(user.companyId || user.company_id);
  return role === 'ADMIN' && !hasComp;
};

/**
 * List subcategories with pagination, filtering, and search.
 * Enforces company multi-tenancy:
 * - SuperAdmin can view all subcategories across companies, or filter by company_id.
 * - Non-SuperAdmin users are strictly scoped to their assigned company.
 */
export const getSubcategories = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  let companyId = query.company_id || query.companyId || null;
  if (companyId) {
    companyId = Number(companyId);
  }

  // Tenant isolation: non-superadmin/admin are strictly scoped to their company
  const canSelect = canUserSelectCompany(user);
  if (!canSelect && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      companyId = Number(userCompId);
    }
  }

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
export const createSubcategory = async (data, files = null, uploadSlug = null, user = null) => {
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
  return toSubcategoryDTO(created);
};

/**
 * Update an existing subcategory:
 * - Derives and syncs company_id directly from the parent category if category is changed.
 * - Prevents cross-company tampering and enforces company multi-tenancy.
 */
export const updateSubcategory = async (id, data, files = null, uploadSlug = null, user = null) => {
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
  return toSubcategoryDTO(updated);
};

/**
 * Update subcategory active status with tenant isolation
 */
export const updateSubcategoryStatus = async (id, isActive, updatedBy = null, user = null) => {
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
  return toSubcategoryDTO(updated);
};

/**
 * Upload or replace subcategory image
 */
export const uploadSubcategoryImage = async (id, files, uploadSlug = null, user = null) => {
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
  return toSubcategoryDTO(updated);
};

/**
 * Delete subcategory image
 */
export const deleteSubcategoryImage = async (id, user = null) => {
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

  return toSubcategoryDTO(updated);
};

/**
 * Delete subcategory by ID (verifying company permission and database references)
 */
export const deleteSubcategory = async (id, user = null) => {
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

  let targetCompanyId = companyId ? Number(companyId) : null;
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      targetCompanyId = Number(userCompId);
    }
  } else if (!targetCompanyId && (user?.companyId || user?.company_id)) {
    targetCompanyId = Number(user.companyId || user.company_id);
  }

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
  checkSubcategoryNameExists,
  checkSubcategoryCodeExists,
};
