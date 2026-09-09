import * as companyBankRepository from './companyBank.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import { toCompanyBankDTO, toCompanyBankListDTO } from './companyBank.mapper.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List company banks with pagination, filtering, and search
 */
export const getBanks = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const accountType = query.account_type || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await companyBankRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    accountType,
    isPrimary,
    isActive,
    sortBy,
    sortOrder,
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    banks: toCompanyBankListDTO(rows),
    meta,
  };
};

/**
 * Get single bank by ID
 */
export const getBankById = async (id) => {
  const bank = await companyBankRepository.findById(id);
  if (!bank) {
    throw new NotFoundError(`Company bank with ID ${id} not found`);
  }
  return toCompanyBankDTO(bank);
};

/**
 * Get all banks for a specific company
 */
export const getBanksByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await companyBankRepository.findByCompanyId(companyId);
  return toCompanyBankListDTO(rows);
};

/**
 * Create new company bank
 */
export const createBank = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (data.is_primary) {
    await companyBankRepository.resetPrimaryForCompany(data.company_id);
  }

  const created = await companyBankRepository.create(data);
  return toCompanyBankDTO(created);
};

/**
 * Update existing company bank
 */
export const updateBank = async (id, data) => {
  const existing = await companyBankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company bank with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id || existing.company_id;

  if (data.is_primary) {
    await companyBankRepository.resetPrimaryForCompany(companyId, id);
  }

  const updated = await companyBankRepository.update(id, data);
  return toCompanyBankDTO(updated);
};

/**
 * Update active status of a bank
 */
export const updateBankStatus = async (id, isActive) => {
  const existing = await companyBankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company bank with ID ${id} not found`);
  }

  const updated = await companyBankRepository.updateStatus(id, isActive);
  return toCompanyBankDTO(updated);
};

/**
 * Set bank as primary for its company
 */
export const setPrimaryBank = async (id) => {
  const existing = await companyBankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company bank with ID ${id} not found`);
  }

  await companyBankRepository.resetPrimaryForCompany(existing.company_id, id);
  const updated = await companyBankRepository.setPrimary(id);
  return toCompanyBankDTO(updated);
};

/**
 * Delete company bank by ID
 */
export const deleteBank = async (id) => {
  const existing = await companyBankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company bank with ID ${id} not found`);
  }

  const deleted = await companyBankRepository.deleteBank(id);
  return toCompanyBankDTO(deleted);
};

export default {
  getBanks,
  getBankById,
  getBanksByCompanyId,
  createBank,
  updateBank,
  updateBankStatus,
  setPrimaryBank,
  deleteBank,
};
