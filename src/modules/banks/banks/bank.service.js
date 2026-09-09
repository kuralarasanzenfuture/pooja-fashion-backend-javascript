import * as bankRepository from './bank.repository.js';
import { toBankDTO, toBankListDTO } from './bank.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * List banks with pagination, filtering, and search
 */
export const getBanks = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const bankType = query.bank_type || null;
  const countryCode = query.country_code || null;
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const isVerified = query.is_verified !== undefined ? query.is_verified : null;

  const { rows, total } = await bankRepository.findAll({
    limit,
    offset,
    search,
    bankType,
    countryCode,
    isActive,
    isVerified,
    sortBy: sortBy || 'display_order',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    banks: toBankListDTO(rows),
    meta,
  };
};

/**
 * Get single bank by ID
 */
export const getBankById = async (id) => {
  const bank = await bankRepository.findById(id);
  if (!bank) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }
  return toBankDTO(bank);
};

/**
 * Get bank by code
 */
export const getBankByCode = async (bankCode) => {
  const bank = await bankRepository.findByCode(bankCode);
  if (!bank) {
    throw new NotFoundError(`Bank with code '${bankCode}' not found`);
  }
  return toBankDTO(bank);
};

/**
 * Create new bank
 */
export const createBank = async (data) => {
  const codeExists = await bankRepository.existsByCode(data.bank_code);
  if (codeExists) {
    throw new BadRequestError(`Bank code '${data.bank_code}' is already in use`);
  }

  const created = await bankRepository.create(data);
  return toBankDTO(created);
};

/**
 * Update existing bank
 */
export const updateBank = async (id, data) => {
  const existing = await bankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }

  if (data.bank_code && data.bank_code !== existing.bank_code) {
    const codeExists = await bankRepository.existsByCode(data.bank_code, id);
    if (codeExists) {
      throw new BadRequestError(`Bank code '${data.bank_code}' is already in use`);
    }
  }

  const updated = await bankRepository.update(id, data);
  return toBankDTO(updated);
};

/**
 * Update active status of a bank
 */
export const updateBankStatus = async (id, isActive) => {
  const existing = await bankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }

  const updated = await bankRepository.updateStatus(id, isActive);
  return toBankDTO(updated);
};

/**
 * Delete bank by ID
 */
export const deleteBank = async (id) => {
  const existing = await bankRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank with ID ${id} not found`);
  }

  const deleted = await bankRepository.deleteBank(id);
  return toBankDTO(deleted);
};

export default {
  getBanks,
  getBankById,
  getBankByCode,
  createBank,
  updateBank,
  updateBankStatus,
  deleteBank,
};
