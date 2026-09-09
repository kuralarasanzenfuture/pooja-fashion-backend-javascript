import * as companyContactRepository from './companyContact.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import { toCompanyContactDTO, toCompanyContactListDTO } from './companyContact.mapper.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List company contacts with pagination, filtering, and search
 */
export const getContacts = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const contactType = query.contact_type || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await companyContactRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    contactType,
    isPrimary,
    isActive,
    sortBy,
    sortOrder,
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    contacts: toCompanyContactListDTO(rows),
    meta,
  };
};

/**
 * Get single contact by ID
 */
export const getContactById = async (id) => {
  const contact = await companyContactRepository.findById(id);
  if (!contact) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
  }
  return toCompanyContactDTO(contact);
};

/**
 * Get all contacts for a specific company
 */
export const getContactsByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await companyContactRepository.findByCompanyId(companyId);
  return toCompanyContactListDTO(rows);
};

/**
 * Create new company contact
 */
export const createContact = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (data.is_primary) {
    await companyContactRepository.resetPrimaryForCompany(data.company_id);
  }

  const created = await companyContactRepository.create(data);
  return toCompanyContactDTO(created);
};

/**
 * Update existing company contact
 */
export const updateContact = async (id, data) => {
  const existing = await companyContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id || existing.company_id;

  if (data.is_primary) {
    await companyContactRepository.resetPrimaryForCompany(companyId, id);
  }

  const updated = await companyContactRepository.update(id, data);
  return toCompanyContactDTO(updated);
};

/**
 * Update active status of a contact
 */
export const updateContactStatus = async (id, isActive) => {
  const existing = await companyContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
  }

  const updated = await companyContactRepository.updateStatus(id, isActive);
  return toCompanyContactDTO(updated);
};

/**
 * Set contact as primary for its company
 */
export const setPrimaryContact = async (id) => {
  const existing = await companyContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
  }

  await companyContactRepository.resetPrimaryForCompany(existing.company_id, id);
  const updated = await companyContactRepository.setPrimary(id);
  return toCompanyContactDTO(updated);
};

/**
 * Delete company contact by ID
 */
export const deleteContact = async (id) => {
  const existing = await companyContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
  }

  const deleted = await companyContactRepository.deleteContact(id);
  return toCompanyContactDTO(deleted);
};

export default {
  getContacts,
  getContactById,
  getContactsByCompanyId,
  createContact,
  updateContact,
  updateContactStatus,
  setPrimaryContact,
  deleteContact,
};
