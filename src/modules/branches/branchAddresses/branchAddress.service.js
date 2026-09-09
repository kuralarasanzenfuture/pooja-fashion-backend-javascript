import * as branchAddressRepository from './branchAddress.repository.js';
import * as branchRepository from '../branches/branch.repository.js';
import { toBranchAddressDTO, toBranchAddressListDTO } from './branchAddress.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * List branch addresses with pagination, filtering, and search
 */
export const getAddresses = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const branchId = query.branch_id || query.branchId || null;
  const city = query.city || null;
  const state = query.state || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await branchAddressRepository.findAll({
    limit,
    offset,
    search,
    branchId,
    city,
    state,
    isPrimary,
    isActive,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    addresses: toBranchAddressListDTO(rows),
    meta,
  };
};

/**
 * Get branch address by ID
 */
export const getAddressById = async (id) => {
  const address = await branchAddressRepository.findById(id);
  if (!address) {
    throw new NotFoundError(`Branch address with ID ${id} not found`);
  }
  return toBranchAddressDTO(address);
};

/**
 * Get all addresses for a specific branch
 */
export const getAddressesByBranchId = async (branchId) => {
  const branch = await branchRepository.findById(branchId);
  if (!branch) {
    throw new NotFoundError(`Branch with ID ${branchId} not found`);
  }

  const rows = await branchAddressRepository.findByBranchId(branchId);
  return toBranchAddressListDTO(rows);
};

/**
 * Create a new branch address
 */
export const createAddress = async (data) => {
  const branch = await branchRepository.findById(data.branch_id);
  if (!branch) {
    throw new NotFoundError(`Branch with ID ${data.branch_id} not found`);
  }

  if (data.is_primary) {
    await branchAddressRepository.resetPrimary(data.branch_id);
  }

  const created = await branchAddressRepository.create(data);
  return toBranchAddressDTO(created);
};

/**
 * Update an existing branch address
 */
export const updateAddress = async (id, data) => {
  const existing = await branchAddressRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch address with ID ${id} not found`);
  }

  if (data.is_primary === true) {
    await branchAddressRepository.resetPrimary(existing.branch_id, id);
  }

  const updated = await branchAddressRepository.update(id, data);
  return toBranchAddressDTO(updated);
};

/**
 * Update address active status
 */
export const updateAddressStatus = async (id, isActive) => {
  const existing = await branchAddressRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch address with ID ${id} not found`);
  }

  const updated = await branchAddressRepository.updateStatus(id, isActive);
  return toBranchAddressDTO(updated);
};

/**
 * Set an address as primary for its branch
 */
export const setPrimaryAddress = async (id) => {
  const existing = await branchAddressRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch address with ID ${id} not found`);
  }

  await branchAddressRepository.resetPrimary(existing.branch_id, id);
  const updated = await branchAddressRepository.update(id, { is_primary: true });
  return toBranchAddressDTO(updated);
};

/**
 * Delete branch address
 */
export const deleteAddress = async (id) => {
  const existing = await branchAddressRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch address with ID ${id} not found`);
  }

  const deleted = await branchAddressRepository.deleteAddress(id);
  return toBranchAddressDTO(deleted);
};

export default {
  getAddresses,
  getAddressById,
  getAddressesByBranchId,
  createAddress,
  updateAddress,
  updateAddressStatus,
  setPrimaryAddress,
  deleteAddress,
};
