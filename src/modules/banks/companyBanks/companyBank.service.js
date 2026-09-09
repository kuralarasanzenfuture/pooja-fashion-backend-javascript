import * as companyBankRepository from './companyBank.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import * as bankRepository from '../banks/bank.repository.js';
import { toCompanyBankDTO, toCompanyBankListDTO } from './companyBank.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * List company banks with pagination, filtering, and search
 */
export const getBanks = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const bankId = query.bank_id || query.bankId || null;
  const accountType = query.account_type || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await companyBankRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    bankId,
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
 * Get single company bank by ID
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
 * Create new company bank account
 */
export const createBank = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  const bank = await bankRepository.findById(data.bank_id);
  if (!bank) {
    throw new NotFoundError(`Bank with ID ${data.bank_id} not found`);
  }

  const accountExists = await companyBankRepository.existsAccountNumber(
    data.company_id,
    data.account_number
  );
  if (accountExists) {
    throw new BadRequestError(
      `Account number '${data.account_number}' already exists for this company`
    );
  }

  if (data.is_primary) {
    await companyBankRepository.resetPrimaryForCompany(data.company_id);
  }

  const created = await companyBankRepository.create(data);
  return toCompanyBankDTO(created);
};

/**
 * Update existing company bank account
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

  if (data.bank_id && Number(data.bank_id) !== Number(existing.bank_id)) {
    const targetBank = await bankRepository.findById(data.bank_id);
    if (!targetBank) {
      throw new NotFoundError(`Bank with ID ${data.bank_id} not found`);
    }
  }

  const companyId = data.company_id || existing.company_id;
  const accountNumber = data.account_number || existing.account_number;

  if (data.account_number && data.account_number !== existing.account_number) {
    const accountExists = await companyBankRepository.existsAccountNumber(
      companyId,
      accountNumber,
      id
    );
    if (accountExists) {
      throw new BadRequestError(
        `Account number '${accountNumber}' already exists for this company`
      );
    }
  }

  if (data.is_primary) {
    await companyBankRepository.resetPrimaryForCompany(companyId, id);
  }

  const updated = await companyBankRepository.update(id, data);
  return toCompanyBankDTO(updated);
};

/**
 * Update active status
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
 * Set bank as primary
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
 * Delete company bank account
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
