import * as companyTaxDetailRepository from './companyTaxDetail.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import { toCompanyTaxDetailDTO, toCompanyTaxDetailListDTO } from './companyTaxDetail.mapper.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

export const getTaxDetails = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const gstRegistrationType = query.gst_registration_type || query.gstRegistrationType || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : (query.isPrimary !== undefined ? query.isPrimary : null);
  const isActive = query.is_active !== undefined ? query.is_active : (query.isActive !== undefined ? query.isActive : null);

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

export const getTaxDetailById = async (id) => {
  const taxDetail = await companyTaxDetailRepository.findById(id);
  if (!taxDetail) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }
  return toCompanyTaxDetailDTO(taxDetail);
};

export const getTaxDetailsByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await companyTaxDetailRepository.findByCompanyId(companyId);
  return toCompanyTaxDetailListDTO(rows);
};

export const getPrimaryTaxDetailByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const taxDetail = await companyTaxDetailRepository.findPrimaryByCompanyId(companyId);
  return taxDetail ? toCompanyTaxDetailDTO(taxDetail) : null;
};

export const createTaxDetail = async (data) => {
  const companyId = data.company_id || data.companyId;
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const existing = await companyTaxDetailRepository.findByCompanyId(companyId);
  const shouldBePrimary = Boolean(data.is_primary ?? data.isPrimary ?? (existing.length === 0));

  if (shouldBePrimary) {
    await companyTaxDetailRepository.resetPrimaryForCompany(companyId);
  }

  const payload = {
    ...data,
    company_id: companyId,
    is_primary: shouldBePrimary,
  };

  const created = await companyTaxDetailRepository.create(payload);
  return toCompanyTaxDetailDTO(created);
};

export const updateTaxDetail = async (id, data) => {
  const existing = await companyTaxDetailRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }

  const targetCompanyId = data.company_id || data.companyId || existing.company_id;
  if (Number(targetCompanyId) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(targetCompanyId);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${targetCompanyId} not found`);
    }
  }

  const isPrimary = data.is_primary !== undefined ? data.is_primary : data.isPrimary;
  if (isPrimary) {
    await companyTaxDetailRepository.resetPrimaryForCompany(targetCompanyId, id);
  }

  const payload = {
    ...data,
    company_id: targetCompanyId,
    ...(isPrimary !== undefined ? { is_primary: isPrimary } : {}),
  };

  const updated = await companyTaxDetailRepository.update(id, payload);
  return toCompanyTaxDetailDTO(updated);
};

export const updateTaxDetailStatus = async (id, isActive) => {
  const existing = await companyTaxDetailRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }

  const updated = await companyTaxDetailRepository.updateStatus(id, Boolean(isActive));
  return toCompanyTaxDetailDTO(updated);
};

export const setPrimaryTaxDetail = async (id) => {
  const existing = await companyTaxDetailRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company tax detail with ID ${id} not found`);
  }

  await companyTaxDetailRepository.resetPrimaryForCompany(existing.company_id, id);
  const updated = await companyTaxDetailRepository.setPrimary(id);
  return toCompanyTaxDetailDTO(updated);
};

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
  getPrimaryTaxDetailByCompanyId,
  createTaxDetail,
  updateTaxDetail,
  updateTaxDetailStatus,
  setPrimaryTaxDetail,
  deleteTaxDetail,
};
