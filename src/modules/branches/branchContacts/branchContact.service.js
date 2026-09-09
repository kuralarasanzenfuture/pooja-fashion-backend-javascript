import * as branchContactRepository from './branchContact.repository.js';
import * as branchRepository from '../branches/branch.repository.js';
import { toBranchContactDTO, toBranchContactListDTO } from './branchContact.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * List branch contacts with pagination, filtering, and search
 */
export const getContacts = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const branchId = query.branch_id || query.branchId || null;
  const designation = query.designation || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await branchContactRepository.findAll({
    limit,
    offset,
    search,
    branchId,
    designation,
    isPrimary,
    isActive,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    contacts: toBranchContactListDTO(rows),
    meta,
  };
};

/**
 * Get branch contact by ID
 */
export const getContactById = async (id) => {
  const contact = await branchContactRepository.findById(id);
  if (!contact) {
    throw new NotFoundError(`Branch contact with ID ${id} not found`);
  }
  return toBranchContactDTO(contact);
};

/**
 * Get all contacts for a specific branch
 */
export const getContactsByBranchId = async (branchId) => {
  const branch = await branchRepository.findById(branchId);
  if (!branch) {
    throw new NotFoundError(`Branch with ID ${branchId} not found`);
  }

  const rows = await branchContactRepository.findByBranchId(branchId);
  return toBranchContactListDTO(rows);
};

/**
 * Create a new branch contact
 */
export const createContact = async (data) => {
  const branch = await branchRepository.findById(data.branch_id);
  if (!branch) {
    throw new NotFoundError(`Branch with ID ${data.branch_id} not found`);
  }

  if (data.is_primary) {
    await branchContactRepository.resetPrimary(data.branch_id);
  }

  const created = await branchContactRepository.create(data);
  return toBranchContactDTO(created);
};

/**
 * Update an existing branch contact
 */
export const updateContact = async (id, data) => {
  const existing = await branchContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch contact with ID ${id} not found`);
  }

  if (data.is_primary === true) {
    await branchContactRepository.resetPrimary(existing.branch_id, id);
  }

  const updated = await branchContactRepository.update(id, data);
  return toBranchContactDTO(updated);
};

/**
 * Update contact active status
 */
export const updateContactStatus = async (id, isActive) => {
  const existing = await branchContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch contact with ID ${id} not found`);
  }

  const updated = await branchContactRepository.updateStatus(id, isActive);
  return toBranchContactDTO(updated);
};

/**
 * Set a contact as primary for its branch
 */
export const setPrimaryContact = async (id) => {
  const existing = await branchContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch contact with ID ${id} not found`);
  }

  await branchContactRepository.resetPrimary(existing.branch_id, id);
  const updated = await branchContactRepository.update(id, { is_primary: true });
  return toBranchContactDTO(updated);
};

/**
 * Delete branch contact
 */
export const deleteContact = async (id) => {
  const existing = await branchContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch contact with ID ${id} not found`);
  }

  const deleted = await branchContactRepository.deleteContact(id);
  return toBranchContactDTO(deleted);
};

export default {
  getContacts,
  getContactById,
  getContactsByBranchId,
  createContact,
  updateContact,
  updateContactStatus,
  setPrimaryContact,
  deleteContact,
};
