import * as companyContactService from './companyContact.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const { contacts, meta } = await companyContactService.getContacts(req.query);
    return sendSuccess(res, contacts, 'Company contacts retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const contact = await companyContactService.getContactById(req.params.id);
    return sendSuccess(res, contact, 'Company contact retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getByCompanyId = async (req, res, next) => {
  try {
    const contacts = await companyContactService.getContactsByCompanyId(req.params.companyId);
    return sendSuccess(res, contacts, 'Company contacts retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getPrimaryByCompanyId = async (req, res, next) => {
  try {
    const contact = await companyContactService.getPrimaryContactByCompanyId(req.params.companyId);
    return sendSuccess(res, contact, 'Primary company contact retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const contact = await companyContactService.createContact(req.body);
    return sendCreated(res, contact, 'Company contact created successfully');
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const contact = await companyContactService.updateContact(req.params.id, req.body);
    return sendSuccess(res, contact, 'Company contact updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const isActive = req.body.is_active !== undefined ? req.body.is_active : req.body.isActive;
    const contact = await companyContactService.updateContactStatus(
      req.params.id,
      isActive
    );
    return sendSuccess(res, contact, 'Company contact status updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const setPrimary = async (req, res, next) => {
  try {
    const contact = await companyContactService.setPrimaryContact(req.params.id);
    return sendSuccess(res, contact, 'Company contact set as primary successfully');
  } catch (error) {
    return next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const deleted = await companyContactService.deleteContact(req.params.id);
    return sendSuccess(res, deleted, 'Company contact deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCompanyId,
  getPrimaryByCompanyId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteContact,
};
