import * as brandRepository from './brand.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toBrandDTO, toBrandListDTO } from './brand.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { deleteFileByUrl } from '../../../shared/utils/file.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  toSlug,
  extractUploadedLogo,
  generateBrandCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  toSlug,
  extractUploadedLogo,
  generateBrandCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * List brands with pagination, filtering, and search.
 * Enforces company multi-tenancy:
 * - SuperAdmin can view all brands across companies, or filter by company_id.
 * - Non-SuperAdmin users are strictly scoped to their assigned company.
 */
export const getBrands = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const hasLogo = query.has_logo || query.hasLogo || null;

  const { rows, total } = await brandRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    hasLogo,
    sortBy: sortBy || 'display_order',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    brands: toBrandListDTO(rows),
    meta,
  };
};

/**
 * Get all brands for a company without pagination (for dropdowns / selectors)
 * Strictly scopes to token-based user's company_id
 */
export const getAllBrands = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const hasLogo = query.has_logo || query.hasLogo || null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'display_order';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await brandRepository.findAllByCompany(companyId, {
    isActive,
    hasLogo,
    search,
    sortBy,
    sortOrder,
  });

  return toBrandListDTO(rows);
};

/**
 * Get brand aggregate statistics for user's company
 */
export const getBrandStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  return brandRepository.getBrandStats(companyId);
};

/**
 * Reorder brands in bulk
 */
export const reorderBrands = async (items = [], user = null, requestContext = null) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Items array is required for reordering');
  }

  const effectiveCompanyId = resolveEffectiveCompanyId(user);
  const updatedIds = await brandRepository.reorderBrands(items, effectiveCompanyId);

  await recordAuditLog({
    action: 'REORDER',
    module: 'brands',
    entityType: 'Brand',
    entityId: updatedIds[0] || null,
    entityName: 'Brands Reorder',
    companyId: effectiveCompanyId,
    userId: user?.id,
    description: `Reordered ${updatedIds.length} brands`,
    oldData: null,
    newData: { ids: updatedIds },
    requestContext,
  });

  return {
    success: true,
    message: `Successfully reordered ${updatedIds.length} brands`,
    updatedCount: updatedIds.length,
    updatedIds,
  };
};

/**
 * Get single brand by primary ID with tenant isolation verification
 */
export const getBrandById = async (id, user = null) => {
  const brand = await brandRepository.findById(id);
  if (!brand) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(brand.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view brands for another company');
    }
  }

  return toBrandDTO(brand);
};

/**
 * Get brand by company ID and brand code with tenant isolation verification
 */
export const getBrandByCode = async (companyId, brandCode, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view brands for another company');
    }
  }

  const brand = await brandRepository.findByCode(companyId, brandCode);
  if (!brand) {
    throw new NotFoundError(`Brand with code '${brandCode}' not found for company ${companyId}`);
  }
  return toBrandDTO(brand);
};

/**
 * Get all brands for a company with tenant isolation verification
 */
export const getBrandsByCompanyId = async (companyId, options = {}, user = null) => {
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(companyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view brands for another company');
    }
  }

  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await brandRepository.findByCompanyId(companyId, options);
  return toBrandListDTO(rows);
};

/**
 * Create a new brand with company multi-tenancy and audit logging
 */
export const createBrand = async (
  data,
  files = null,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
  // Determine effective company_id
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      if (data.company_id && Number(data.company_id) !== Number(userCompId)) {
        throw new ForbiddenError('You do not have permission to create brands for another company');
      }
      data.company_id = Number(userCompId);
    }
  }

  if (!data.company_id) {
    if (user?.companyId || user?.company_id) {
      data.company_id = Number(user.companyId || user.company_id);
    } else {
      throw new BadRequestError('Company ID is required to create a brand');
    }
  }

  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (!data.brand_code || !data.brand_code.trim()) {
    data.brand_code = generateBrandCode(data.brand_name);
  } else {
    data.brand_code = data.brand_code.trim().toUpperCase();
  }

  const codeExists = await brandRepository.existsByCode(data.company_id, data.brand_code);
  if (codeExists) {
    throw new BadRequestError(`Brand code '${data.brand_code}' already exists for this company`);
  }

  const nameExists = await brandRepository.existsByName(data.company_id, data.brand_name);
  if (nameExists) {
    throw new BadRequestError(`Brand name '${data.brand_name}' already exists for this company`);
  }

  if (user?.id) {
    data.created_by = user.id;
  }

  const slug = uploadSlug || toSlug(data.brand_name || data.brand_code);
  const uploadedFiles = extractUploadedLogo(files, slug);
  Object.assign(data, uploadedFiles);

  const created = await brandRepository.create(data);
  const dto = toBrandDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'brands',
    entityType: 'Brand',
    entityId: created.id,
    entityName: created.brand_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Brand "${created.brand_name}" (Code: ${created.brand_code}) created`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing brand with company multi-tenancy and audit logging
 */
export const updateBrand = async (
  id,
  data,
  files = null,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  // Tenant permission check on existing brand
  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update brands for another company');
    }
  }

  let targetCompanyId = Number(existing.company_id);

  if (data.company_id && Number(data.company_id) !== targetCompanyId) {
    if (!canUserSelectCompany(user) && user) {
      throw new ForbiddenError('You do not have permission to move brands to another company');
    }
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
    targetCompanyId = Number(data.company_id);
  }

  if (data.brand_code) {
    data.brand_code = data.brand_code.trim().toUpperCase();
    const codeExists = await brandRepository.existsByCode(targetCompanyId, data.brand_code, id);
    if (codeExists) {
      throw new BadRequestError(`Brand code '${data.brand_code}' already exists for this company`);
    }
  }

  if (data.brand_name) {
    const nameExists = await brandRepository.existsByName(targetCompanyId, data.brand_name, id);
    if (nameExists) {
      throw new BadRequestError(`Brand name '${data.brand_name}' already exists for this company`);
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
  }

  const slug = uploadSlug || toSlug(data.brand_name || existing.brand_name);
  const uploadedFiles = extractUploadedLogo(files, slug);

  if (uploadedFiles.logo_url) {
    if (existing.logo_url) {
      await deleteFileByUrl(existing.logo_url);
    }
    Object.assign(data, uploadedFiles);
  }

  const updated = await brandRepository.update(id, data);
  const dto = toBrandDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'brands',
    entityType: 'Brand',
    entityId: updated.id,
    entityName: updated.brand_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Brand "${updated.brand_name}" updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update brand active status with tenant isolation and audit logging
 */
export const updateBrandStatus = async (
  id,
  isActive,
  updatedBy = null,
  user = null,
  requestContext = null
) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify brands for another company');
    }
  }

  const updated = await brandRepository.updateStatus(id, isActive, updatedBy || user?.id);
  const dto = toBrandDTO(updated);

  await recordAuditLog({
    action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    module: 'brands',
    entityType: 'Brand',
    entityId: updated.id,
    entityName: updated.brand_name,
    companyId: updated.company_id,
    userId: updatedBy || user?.id,
    description: `Brand "${updated.brand_name}" ${isActive ? 'activated' : 'deactivated'}`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Upload or replace brand logo with audit logging
 */
export const uploadBrandLogo = async (
  id,
  files,
  uploadSlug = null,
  user = null,
  requestContext = null
) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify brands for another company');
    }
  }

  const slug = uploadSlug || toSlug(existing.brand_name);
  const uploadedFiles = extractUploadedLogo(files, slug);

  if (!uploadedFiles.logo_url) {
    throw new BadRequestError('No logo image file provided for upload');
  }

  if (existing.logo_url) {
    await deleteFileByUrl(existing.logo_url);
  }

  if (user?.id) {
    uploadedFiles.updated_by = user.id;
  }

  const updated = await brandRepository.update(id, uploadedFiles);
  const dto = toBrandDTO(updated);

  await recordAuditLog({
    action: 'UPLOAD',
    module: 'brands',
    entityType: 'Brand',
    entityId: updated.id,
    entityName: updated.brand_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Logo uploaded for brand "${updated.brand_name}"`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Delete brand logo with audit logging
 */
export const deleteBrandLogo = async (id, user = null, requestContext = null) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to modify brands for another company');
    }
  }

  if (existing.logo_url) {
    await deleteFileByUrl(existing.logo_url);
  }

  const updated = await brandRepository.update(id, {
    logo_url: null,
    logo_key: null,
    updated_by: user?.id || null,
  });
  const dto = toBrandDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'brands',
    entityType: 'Brand',
    entityId: updated.id,
    entityName: updated.brand_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Logo removed from brand "${updated.brand_name}"`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Delete brand by ID with audit logging
 */
export const deleteBrand = async (id, user = null, requestContext = null) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete brands for another company');
    }
  }

  const productCount = await brandRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(
      `Cannot delete brand '${existing.brand_name}' because it is assigned to ${productCount} products`
    );
  }

  if (existing.logo_url) {
    await deleteFileByUrl(existing.logo_url);
  }

  await brandRepository.deleteById(id);

  await recordAuditLog({
    action: 'DELETE',
    module: 'brands',
    entityType: 'Brand',
    entityId: existing.id,
    entityName: existing.brand_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Brand "${existing.brand_name}" (ID: ${id}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return {
    id: Number(id),
    deleted: true,
    message: 'Brand deleted successfully',
  };
};

/**
 * Check whether a brand name already exists in the given company scope
 */
export const checkBrandNameExists = async ({
  name,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    throw new BadRequestError('Brand name is required');
  }

  const targetCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!targetCompanyId) {
    throw new BadRequestError('Company ID is required to check brand name');
  }

  const exists = await brandRepository.existsByName(
    targetCompanyId,
    trimmedName,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    brandName: trimmedName,
    companyId: targetCompanyId,
    message: exists
      ? `Brand name '${trimmedName}' already exists for this company`
      : 'Brand name is available',
  };
};

/**
 * Check whether a brand code already exists in the given company scope
 */
export const checkBrandCodeExists = async ({
  code,
  companyId = null,
  excludeId = null,
  user = null,
}) => {
  const trimmedCode = (code || '').trim().toUpperCase();
  if (!trimmedCode) {
    throw new BadRequestError('Brand code is required');
  }

  const targetCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!targetCompanyId) {
    throw new BadRequestError('Company ID is required to check brand code');
  }

  const exists = await brandRepository.existsByCode(
    targetCompanyId,
    trimmedCode,
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    brandCode: trimmedCode,
    companyId: targetCompanyId,
    message: exists
      ? `Brand code '${trimmedCode}' already exists for this company`
      : 'Brand code is available',
  };
};

export default {
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  getBrands,
  getAllBrands,
  getBrandStats,
  reorderBrands,
  getBrandById,
  getBrandByCode,
  getBrandsByCompanyId,
  createBrand,
  updateBrand,
  updateBrandStatus,
  uploadBrandLogo,
  deleteBrandLogo,
  deleteBrand,
  checkBrandNameExists,
  checkBrandCodeExists,
};
