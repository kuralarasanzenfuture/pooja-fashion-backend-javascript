import * as companyContactService from './companyContact.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/company-contacts
 */
export const getAll = async (req, res, next) => {
  try {
    const { contacts, meta } = await companyContactService.getContacts(req.query);
    return sendSuccess(res, contacts, 'Company contacts retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/company-contacts/:id
 */
export const getById = async (req, res, next) => {
  try {
    const contact = await companyContactService.getContactById(req.params.id);
    return sendSuccess(res, contact, 'Company contact retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/company-contacts/company/:companyId
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const contacts = await companyContactService.getContactsByCompanyId(req.params.companyId);
    return sendSuccess(res, contacts, 'Company contacts retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/company-contacts
 */
export const create = async (req, res, next) => {
  try {
    const contact = await companyContactService.createContact(req.body);
    return sendCreated(res, contact, 'Company contact created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/company-contacts/:id
 */
export const update = async (req, res, next) => {
  try {
    const contact = await companyContactService.updateContact(req.params.id, req.body);
    return sendSuccess(res, contact, 'Company contact updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-contacts/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const contact = await companyContactService.updateContactStatus(
      req.params.id,
      req.body.is_active
    );
    return sendSuccess(res, contact, 'Company contact status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-contacts/:id/primary
 */
export const setPrimary = async (req, res, next) => {
  try {
    const contact = await companyContactService.setPrimaryContact(req.params.id);
    return sendSuccess(res, contact, 'Company contact set as primary successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/company-contacts/:id
 */
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
  create,
  update,
  updateStatus,
  setPrimary,
  deleteContact,
};
