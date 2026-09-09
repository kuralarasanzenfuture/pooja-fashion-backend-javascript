import * as branchContactService from './branchContact.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/branch-contacts
 */
export const getAll = async (req, res, next) => {
  try {
    const { contacts, meta } = await branchContactService.getContacts(req.query);
    return sendSuccess(res, contacts, 'Branch contacts retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/branch-contacts/:id
 */
export const getById = async (req, res, next) => {
  try {
    const contact = await branchContactService.getContactById(req.params.id);
    return sendSuccess(res, contact, 'Branch contact retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/branch-contacts/branch/:branchId
 */
export const getByBranchId = async (req, res, next) => {
  try {
    const contacts = await branchContactService.getContactsByBranchId(req.params.branchId);
    return sendSuccess(res, contacts, 'Branch contacts retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/branch-contacts
 */
export const create = async (req, res, next) => {
  try {
    const contact = await branchContactService.createContact(req.body);
    return sendCreated(res, contact, 'Branch contact created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/branch-contacts/:id
 */
export const update = async (req, res, next) => {
  try {
    const contact = await branchContactService.updateContact(req.params.id, req.body);
    return sendSuccess(res, contact, 'Branch contact updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/branch-contacts/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const contact = await branchContactService.updateContactStatus(
      req.params.id,
      req.body.is_active
    );
    return sendSuccess(res, contact, 'Branch contact status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/branch-contacts/:id/primary
 */
export const setPrimary = async (req, res, next) => {
  try {
    const contact = await branchContactService.setPrimaryContact(req.params.id);
    return sendSuccess(res, contact, 'Branch contact set as primary successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/branch-contacts/:id
 */
export const deleteContact = async (req, res, next) => {
  try {
    const deleted = await branchContactService.deleteContact(req.params.id);
    return sendSuccess(res, deleted, 'Branch contact deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByBranchId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteContact,
};
