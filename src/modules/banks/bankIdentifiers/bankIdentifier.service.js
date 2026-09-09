import * as bankIdentifierRepository from './bankIdentifier.repository.js';
import * as bankRepository from '../banks/bank.repository.js';
import { toBankIdentifierDTO, toBankIdentifierListDTO } from './bankIdentifier.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * List bank identifiers with pagination and filters
 */
export const getIdentifiers = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const bankId = query.bank_id || query.bankId || null;
  const identifierType = query.identifier_type || null;
  const city = query.city || null;
  const state = query.state || null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await bankIdentifierRepository.findAll({
    limit,
    offset,
    search,
    bankId,
    identifierType,
    city,
    state,
    isActive,
    sortBy,
    sortOrder,
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    identifiers: toBankIdentifierListDTO(rows),
    meta,
  };
};

/**
 * Get identifier by ID
 */
export const getIdentifierById = async (id) => {
  const identifier = await bankIdentifierRepository.findById(id);
  if (!identifier) {
    throw new NotFoundError(`Bank identifier with ID ${id} not found`);
  }
  return toBankIdentifierDTO(identifier);
};

/**
 * Get all identifiers for a bank
 */
export const getIdentifiersByBankId = async (bankId) => {
  const bank = await bankRepository.findById(bankId);
  if (!bank) {
    throw new NotFoundError(`Bank with ID ${bankId} not found`);
  }

  const rows = await bankIdentifierRepository.findByBankId(bankId);
  return toBankIdentifierListDTO(rows);
};

/**
 * Lookup identifier by code value (e.g. search by IFSC code)
 */
export const getIdentifierByValue = async (identifierValue, identifierType = null) => {
  const identifier = await bankIdentifierRepository.findByValue(identifierValue, identifierType);
  if (!identifier) {
    throw new NotFoundError(`Bank identifier '${identifierValue}' not found`);
  }
  return toBankIdentifierDTO(identifier);
};

/**
 * Create new bank identifier
 */
export const createIdentifier = async (data) => {
  const bank = await bankRepository.findById(data.bank_id);
  if (!bank) {
    throw new NotFoundError(`Bank with ID ${data.bank_id} not found`);
  }

  const exists = await bankIdentifierRepository.exists(data.identifier_type, data.identifier_value);
  if (exists) {
    throw new BadRequestError(
      `Bank identifier ${data.identifier_type.toUpperCase()} '${data.identifier_value}' already exists`
    );
  }

  const created = await bankIdentifierRepository.create(data);
  return toBankIdentifierDTO(created);
};

/**
 * Update existing bank identifier
 */
export const updateIdentifier = async (id, data) => {
  const existing = await bankIdentifierRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank identifier with ID ${id} not found`);
  }

  if (data.bank_id && Number(data.bank_id) !== Number(existing.bank_id)) {
    const targetBank = await bankRepository.findById(data.bank_id);
    if (!targetBank) {
      throw new NotFoundError(`Bank with ID ${data.bank_id} not found`);
    }
  }

  const targetType = data.identifier_type || existing.identifier_type;
  const targetVal = data.identifier_value || existing.identifier_value;

  if (
    (data.identifier_type && data.identifier_type !== existing.identifier_type) ||
    (data.identifier_value && data.identifier_value !== existing.identifier_value)
  ) {
    const exists = await bankIdentifierRepository.exists(targetType, targetVal, id);
    if (exists) {
      throw new BadRequestError(
        `Bank identifier ${targetType.toUpperCase()} '${targetVal}' already exists`
      );
    }
  }

  const updated = await bankIdentifierRepository.update(id, data);
  return toBankIdentifierDTO(updated);
};

/**
 * Update active status
 */
export const updateIdentifierStatus = async (id, isActive) => {
  const existing = await bankIdentifierRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank identifier with ID ${id} not found`);
  }

  const updated = await bankIdentifierRepository.updateStatus(id, isActive);
  return toBankIdentifierDTO(updated);
};

/**
 * Delete bank identifier
 */
export const deleteIdentifier = async (id) => {
  const existing = await bankIdentifierRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Bank identifier with ID ${id} not found`);
  }

  const deleted = await bankIdentifierRepository.deleteIdentifier(id);
  return toBankIdentifierDTO(deleted);
};

export default {
  getIdentifiers,
  getIdentifierById,
  getIdentifiersByBankId,
  getIdentifierByValue,
  createIdentifier,
  updateIdentifier,
  updateIdentifierStatus,
  deleteIdentifier,
};
