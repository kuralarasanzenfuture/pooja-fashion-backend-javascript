import * as companyTaxDetailRepository from './companyTaxDetail.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import { toCompanyTaxDetailDTO, toCompanyTaxDetailListDTO } from './companyTaxDetail.mapper.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List company tax details with pagination, filtering, and search
 */
export const getTaxDetails = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const gstRegistrationType = query.gst_registration_type || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await companyTaxDetailRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    gstRegistrationType,
    isPrimary,
    isActive,
    sortBy,
    sortOrder,
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    taxDetails: toCompanyTaxDetailListDTO(rows),
    meta,
  };
};

/**
 * Get single tax detail by ID
 */
export const getTaxDetailById = async (id) => {
  const taxDetail = await companyTaxDetailRepository.findById(id);
  if (!taxDetail) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }
  return toCompanyTaxDetailDTO(taxDetail);
};

/**
 * Get all tax details for a specific company
 */
export const getTaxDetailsByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await companyTaxDetailRepository.findByCompanyId(companyId);
  return toCompanyTaxDetailListDTO(rows);
};

/**
 * Create new company tax detail
 */
export const createTaxDetail = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (data.is_primary) {
    await companyTaxDetailRepository.resetPrimaryForCompany(data.company_id);
  }

  const created = await companyTaxDetailRepository.create(data);
  return toCompanyTaxDetailDTO(created);
};

/**
 * Update existing company tax detail
 */
export const updateTaxDetail = async (id, data) => {
  const existing = await companyTaxDetailRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id || existing.company_id;

  if (data.is_primary) {
    await companyTaxDetailRepository.resetPrimaryForCompany(companyId, id);
  }

  const updated = await companyTaxDetailRepository.update(id, data);
  return toCompanyTaxDetailDTO(updated);
};

/**
 * Update active status of a tax detail
 */
export const updateTaxDetailStatus = async (id, isActive) => {
  const existing = await companyTaxDetailRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }

  const updated = await companyTaxDetailRepository.updateStatus(id, isActive);
  return toCompanyTaxDetailDTO(updated);
};

/**
 * Set tax detail as primary for its company
 */
export const setPrimaryTaxDetail = async (id) => {
  const existing = await companyTaxDetailRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }

  await companyTaxDetailRepository.resetPrimaryForCompany(existing.company_id, id);
  const updated = await companyTaxDetailRepository.setPrimary(id);
  return toCompanyTaxDetailDTO(updated);
};

/**
 * Delete company tax detail by ID
 */
export const deleteTaxDetail = async (id) => {
  const existing = await companyTaxDetailRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }

  const deleted = await companyTaxDetailRepository.deleteTaxDetail(id);
  return toCompanyTaxDetailDTO(deleted);
};

export default {
  getTaxDetails,
  getTaxDetailById,
  getTaxDetailsByCompanyId,
  createTaxDetail,
  updateTaxDetail,
  updateTaxDetailStatus,
  setPrimaryTaxDetail,
  deleteTaxDetail,
};
