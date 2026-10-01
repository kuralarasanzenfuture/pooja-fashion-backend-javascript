import * as companyContactRepository from './companyContact.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import { toCompanyContactDTO, toCompanyContactListDTO } from './companyContact.mapper.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

export const getContacts = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const contactType = query.contact_type || query.contactType || null;
  const isPrimary = query.is_primary !== undefined ? query.is_primary : (query.isPrimary !== undefined ? query.isPrimary : null);
  const isActive = query.is_active !== undefined ? query.is_active : (query.isActive !== undefined ? query.isActive : null);

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

export const getContactById = async (id) => {
  const contact = await companyContactRepository.findById(id);
  if (!contact) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
  }
  return toCompanyContactDTO(contact);
};

export const getContactsByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await companyContactRepository.findByCompanyId(companyId);
  return toCompanyContactListDTO(rows);
};

export const getPrimaryContactByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const contact = await companyContactRepository.findPrimaryByCompanyId(companyId);
  return contact ? toCompanyContactDTO(contact) : null;
};

export const createContact = async (data) => {
  const companyId = data.company_id || data.companyId;
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const existingContacts = await companyContactRepository.findByCompanyId(companyId);
  const shouldBePrimary = Boolean(data.is_primary ?? data.isPrimary ?? (existingContacts.length === 0));

  if (shouldBePrimary) {
    await companyContactRepository.resetPrimaryForCompany(companyId);
  }

  const payload = {
    ...data,
    company_id: companyId,
    is_primary: shouldBePrimary,
  };

  const created = await companyContactRepository.create(payload);
  return toCompanyContactDTO(created);
};

export const updateContact = async (id, data) => {
  const existing = await companyContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
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
    await companyContactRepository.resetPrimaryForCompany(targetCompanyId, id);
  }

  const payload = {
    ...data,
    company_id: targetCompanyId,
    ...(isPrimary !== undefined ? { is_primary: isPrimary } : {}),
  };

  const updated = await companyContactRepository.update(id, payload);
  return toCompanyContactDTO(updated);
};

export const updateContactStatus = async (id, isActive) => {
  const existing = await companyContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
  }

  const updated = await companyContactRepository.updateStatus(id, Boolean(isActive));
  return toCompanyContactDTO(updated);
};

export const setPrimaryContact = async (id) => {
  const existing = await companyContactRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company contact with ID ${id} not found`);
  }

  await companyContactRepository.resetPrimaryForCompany(existing.company_id, id);
  const updated = await companyContactRepository.setPrimary(id);
  return toCompanyContactDTO(updated);
};

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
  getPrimaryContactByCompanyId,
  createContact,
  updateContact,
  updateContactStatus,
  setPrimaryContact,
  deleteContact,
};
