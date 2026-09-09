import * as companyAddressService from './companyAddress.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/company-addresses
 */
export const getAll = async (req, res, next) => {
  try {
    const { addresses, meta } = await companyAddressService.getAddresses(req.query);
    return sendSuccess(res, addresses, 'Company addresses retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/company-addresses/:id
 */
export const getById = async (req, res, next) => {
  try {
    const address = await companyAddressService.getAddressById(req.params.id);
    return sendSuccess(res, address, 'Company address retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/company-addresses/company/:companyId
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const addresses = await companyAddressService.getAddressesByCompanyId(req.params.companyId);
    return sendSuccess(res, addresses, 'Company addresses retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/company-addresses
 */
export const create = async (req, res, next) => {
  try {
    const address = await companyAddressService.createAddress(req.body);
    return sendCreated(res, address, 'Company address created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/company-addresses/:id
 */
export const update = async (req, res, next) => {
  try {
    const address = await companyAddressService.updateAddress(req.params.id, req.body);
    return sendSuccess(res, address, 'Company address updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-addresses/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const address = await companyAddressService.updateAddressStatus(
      req.params.id,
      req.body.is_active
    );
    return sendSuccess(res, address, 'Company address status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-addresses/:id/primary
 */
export const setPrimary = async (req, res, next) => {
  try {
    const address = await companyAddressService.setPrimaryAddress(req.params.id);
    return sendSuccess(res, address, 'Company address set as primary successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/company-addresses/:id
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const deleted = await companyAddressService.deleteAddress(req.params.id);
    return sendSuccess(res, deleted, 'Company address deleted successfully');
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
  deleteAddress,
};
