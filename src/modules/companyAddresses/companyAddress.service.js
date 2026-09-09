import * as companyAddressRepository from './companyAddress.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import { toCompanyAddressDTO, toCompanyAddressListDTO } from './companyAddress.mapper.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List company addresses with pagination, filtering, and search
 */
export const getAddresses = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const addressType = query.address_type || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await companyAddressRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    addressType,
    isPrimary,
    isActive,
    sortBy,
    sortOrder,
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    addresses: toCompanyAddressListDTO(rows),
    meta,
  };
};

/**
 * Get single address by ID
 */
export const getAddressById = async (id) => {
  const address = await companyAddressRepository.findById(id);
  if (!address) {
    throw new NotFoundError(`Company address with ID ${id} not found`);
  }
  return toCompanyAddressDTO(address);
};

/**
 * Get all addresses for a specific company
 */
export const getAddressesByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await companyAddressRepository.findByCompanyId(companyId);
  return toCompanyAddressListDTO(rows);
};

/**
 * Create new company address
 */
export const createAddress = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (data.is_primary) {
    await companyAddressRepository.resetPrimaryForCompany(data.company_id);
  }

  const created = await companyAddressRepository.create(data);
  return toCompanyAddressDTO(created);
};

/**
 * Update existing company address
 */
export const updateAddress = async (id, data) => {
  const existing = await companyAddressRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company address with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id || existing.company_id;

  if (data.is_primary) {
    await companyAddressRepository.resetPrimaryForCompany(companyId, id);
  }

  const updated = await companyAddressRepository.update(id, data);
  return toCompanyAddressDTO(updated);
};

/**
 * Update active status of an address
 */
export const updateAddressStatus = async (id, isActive) => {
  const existing = await companyAddressRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company address with ID ${id} not found`);
  }

  const updated = await companyAddressRepository.updateStatus(id, isActive);
  return toCompanyAddressDTO(updated);
};

/**
 * Set address as primary for its company
 */
export const setPrimaryAddress = async (id) => {
  const existing = await companyAddressRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company address with ID ${id} not found`);
  }

  await companyAddressRepository.resetPrimaryForCompany(existing.company_id, id);
  const updated = await companyAddressRepository.setPrimary(id);
  return toCompanyAddressDTO(updated);
};

/**
 * Delete company address by ID
 */
export const deleteAddress = async (id) => {
  const existing = await companyAddressRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company address with ID ${id} not found`);
  }

  const deleted = await companyAddressRepository.deleteAddress(id);
  return toCompanyAddressDTO(deleted);
};

export default {
  getAddresses,
  getAddressById,
  getAddressesByCompanyId,
  createAddress,
  updateAddress,
  updateAddressStatus,
  setPrimaryAddress,
  deleteAddress,
};
