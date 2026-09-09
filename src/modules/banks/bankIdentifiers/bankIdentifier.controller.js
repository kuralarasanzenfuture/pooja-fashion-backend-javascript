import * as bankIdentifierService from './bankIdentifier.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/bank-identifiers
 */
export const getAll = async (req, res, next) => {
  try {
    const { identifiers, meta } = await bankIdentifierService.getIdentifiers(req.query);
    return sendSuccess(res, identifiers, 'Bank identifiers retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/bank-identifiers/:id
 */
export const getById = async (req, res, next) => {
  try {
    const identifier = await bankIdentifierService.getIdentifierById(req.params.id);
    return sendSuccess(res, identifier, 'Bank identifier retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/bank-identifiers/bank/:bankId
 */
export const getByBankId = async (req, res, next) => {
  try {
    const identifiers = await bankIdentifierService.getIdentifiersByBankId(req.params.bankId);
    return sendSuccess(res, identifiers, 'Bank identifiers retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/bank-identifiers/value/:identifierValue
 */
export const getByValue = async (req, res, next) => {
  try {
    const identifier = await bankIdentifierService.getIdentifierByValue(
      req.params.identifierValue,
      req.query.identifier_type
    );
    return sendSuccess(res, identifier, 'Bank identifier retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/bank-identifiers
 */
export const create = async (req, res, next) => {
  try {
    const identifier = await bankIdentifierService.createIdentifier(req.body);
    return sendCreated(res, identifier, 'Bank identifier created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/bank-identifiers/:id
 */
export const update = async (req, res, next) => {
  try {
    const identifier = await bankIdentifierService.updateIdentifier(req.params.id, req.body);
    return sendSuccess(res, identifier, 'Bank identifier updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/bank-identifiers/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const identifier = await bankIdentifierService.updateIdentifierStatus(
      req.params.id,
      req.body.is_active
    );
    return sendSuccess(res, identifier, 'Bank identifier status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/bank-identifiers/:id
 */
export const deleteIdentifier = async (req, res, next) => {
  try {
    const deleted = await bankIdentifierService.deleteIdentifier(req.params.id);
    return sendSuccess(res, deleted, 'Bank identifier deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByBankId,
  getByValue,
  create,
  update,
  updateStatus,
  deleteIdentifier,
};
