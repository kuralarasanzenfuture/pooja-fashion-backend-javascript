import * as brandRepository from './brand.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toBrandDTO, toBrandListDTO } from './brand.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { toSlug, deleteFileByUrl } from '../../../shared/utils/file.js';

/**
 * Extract uploaded logo URL from req.files dictionary
 */
export const extractUploadedLogo = (files, brandSlug) => {
  const result = {};
  if (!files) return result;

  const slug = brandSlug || 'brand';

  if (files.logo && files.logo[0]) {
    result.logo_url = `/uploads/brands/${slug}/${files.logo[0].filename}`;
    result.logo_key = `brands/${slug}/${files.logo[0].filename}`;
  } else if (files.logo_url && files.logo_url[0]) {
    result.logo_url = `/uploads/brands/${slug}/${files.logo_url[0].filename}`;
    result.logo_key = `brands/${slug}/${files.logo_url[0].filename}`;
  } else if (files.image && files.image[0]) {
    result.logo_url = `/uploads/brands/${slug}/${files.image[0].filename}`;
    result.logo_key = `brands/${slug}/${files.image[0].filename}`;
  }

  return result;
};

/**
 * Generate fallback brand code from name if omitted
 */
export const generateBrandCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * List brands with pagination, filtering, and search
 */
export const getBrands = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await brandRepository.findAll({
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
    brands: toBrandListDTO(rows),
    meta,
  };
};

/**
 * Get single brand by primary ID
 */
export const getBrandById = async (id) => {
  const brand = await brandRepository.findById(id);
  if (!brand) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }
  return toBrandDTO(brand);
};

/**
 * Get brand by company ID and brand code
 */
export const getBrandByCode = async (companyId, brandCode) => {
  const brand = await brandRepository.findByCode(companyId, brandCode);
  if (!brand) {
    throw new NotFoundError(`Brand with code '${brandCode}' not found for company ${companyId}`);
  }
  return toBrandDTO(brand);
};

/**
 * Get all brands for a company
 */
export const getBrandsByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await brandRepository.findByCompanyId(companyId, options);
  return toBrandListDTO(rows);
};

/**
 * Create a new brand
 */
export const createBrand = async (data, files = null, uploadSlug = null) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (!data.brand_code) {
    data.brand_code = generateBrandCode(data.brand_name);
  }

  const codeExists = await brandRepository.existsByCode(data.company_id, data.brand_code);
  if (codeExists) {
    throw new BadRequestError(`Brand code '${data.brand_code}' already exists for this company`);
  }

  const nameExists = await brandRepository.existsByName(data.company_id, data.brand_name);
  if (nameExists) {
    throw new BadRequestError(`Brand name '${data.brand_name}' already exists for this company`);
  }

  const slug = uploadSlug || toSlug(data.brand_name || data.brand_code);
  const uploadedFiles = extractUploadedLogo(files, slug);
  Object.assign(data, uploadedFiles);

  const created = await brandRepository.create(data);
  return toBrandDTO(created);
};

/**
 * Update an existing brand
 */
export const updateBrand = async (id, data, files = null, uploadSlug = null) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);

  if (data.brand_code) {
    const codeExists = await brandRepository.existsByCode(companyId, data.brand_code, id);
    if (codeExists) {
      throw new BadRequestError(`Brand code '${data.brand_code}' already exists for this company`);
    }
  }

  if (data.brand_name) {
    const nameExists = await brandRepository.existsByName(companyId, data.brand_name, id);
    if (nameExists) {
      throw new BadRequestError(`Brand name '${data.brand_name}' already exists for this company`);
    }
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
  return toBrandDTO(updated);
};

/**
 * Update brand active status
 */
export const updateBrandStatus = async (id, isActive, updatedBy = null) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  const updated = await brandRepository.updateStatus(id, isActive, updatedBy);
  return toBrandDTO(updated);
};

/**
 * Upload or replace brand logo
 */
export const uploadBrandLogo = async (id, files, uploadSlug = null) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  const slug = uploadSlug || toSlug(existing.brand_name);
  const uploadedFiles = extractUploadedLogo(files, slug);

  if (!uploadedFiles.logo_url) {
    throw new BadRequestError('No logo image file provided for upload');
  }

  if (existing.logo_url) {
    await deleteFileByUrl(existing.logo_url);
  }

  const updated = await brandRepository.update(id, uploadedFiles);
  return toBrandDTO(updated);
};

/**
 * Delete brand logo
 */
export const deleteBrandLogo = async (id) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
  }

  if (existing.logo_url) {
    await deleteFileByUrl(existing.logo_url);
  }

  const updated = await brandRepository.update(id, {
    logo_url: null,
    logo_key: null,
  });

  return toBrandDTO(updated);
};

/**
 * Delete brand by ID
 */
export const deleteBrand = async (id) => {
  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Brand with ID ${id} not found`);
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

  return {
    id: Number(id),
    deleted: true,
    message: 'Brand deleted successfully',
  };
};

export default {
  getBrands,
  getBrandById,
  getBrandByCode,
  getBrandsByCompanyId,
  createBrand,
  updateBrand,
  updateBrandStatus,
  uploadBrandLogo,
  deleteBrandLogo,
  deleteBrand,
};
