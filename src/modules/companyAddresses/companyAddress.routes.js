import { Router } from 'express';
import {
  getAll,
  getById,
  getByCompanyId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteAddress,
} from './companyAddress.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createCompanyAddressSchema,
  updateCompanyAddressSchema,
  updateStatusSchema,
  addressIdParamSchema,
  companyIdParamSchema,
  getCompanyAddressesQuerySchema,
} from './companyAddress.validation.js';

const router = Router();

// GET /api/company-addresses - List addresses with pagination & filters
router.get('/', validate(getCompanyAddressesQuerySchema, 'query'), getAll);

// GET /api/company-addresses/company/:companyId - List all addresses for a specific company
router.get('/company/:companyId', validate(companyIdParamSchema, 'params'), getByCompanyId);

// GET /api/company-addresses/:id - Retrieve address by primary ID
router.get('/:id', validate(addressIdParamSchema, 'params'), getById);

// POST /api/company-addresses - Create new company address
router.post('/', validate(createCompanyAddressSchema, 'body'), create);

// PUT /api/company-addresses/:id - Update existing company address
router.put(
  '/:id',
  validate(addressIdParamSchema, 'params'),
  validate(updateCompanyAddressSchema, 'body'),
  update
);

// PATCH /api/company-addresses/:id/status - Update active status of address
router.patch(
  '/:id/status',
  validate(addressIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// PATCH /api/company-addresses/:id/primary - Mark address as primary
router.patch('/:id/primary', validate(addressIdParamSchema, 'params'), setPrimary);

// DELETE /api/company-addresses/:id - Remove company address
router.delete('/:id', validate(addressIdParamSchema, 'params'), deleteAddress);

export default router;
