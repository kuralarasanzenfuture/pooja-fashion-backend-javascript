import { Router } from 'express';
import {
  getAll,
  getById,
  getByCompanyId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteTaxDetail,
} from './companyTaxDetail.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createCompanyTaxDetailSchema,
  updateCompanyTaxDetailSchema,
  updateStatusSchema,
  taxDetailIdParamSchema,
  companyIdParamSchema,
  getCompanyTaxDetailsQuerySchema,
} from './companyTaxDetail.validation.js';

const router = Router();

// GET /api/company-tax-details - List tax details with pagination & filters
router.get('/', validate(getCompanyTaxDetailsQuerySchema, 'query'), getAll);

// GET /api/company-tax-details/company/:companyId - List all tax details for a company
router.get('/company/:companyId', validate(companyIdParamSchema, 'params'), getByCompanyId);

// GET /api/company-tax-details/:id - Retrieve tax detail by ID
router.get('/:id', validate(taxDetailIdParamSchema, 'params'), getById);

// POST /api/company-tax-details - Create new company tax detail
router.post('/', validate(createCompanyTaxDetailSchema, 'body'), create);

// PUT /api/company-tax-details/:id - Update existing company tax detail
router.put(
  '/:id',
  validate(taxDetailIdParamSchema, 'params'),
  validate(updateCompanyTaxDetailSchema, 'body'),
  update
);

// PATCH /api/company-tax-details/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(taxDetailIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// PATCH /api/company-tax-details/:id/primary - Set tax detail as primary
router.patch('/:id/primary', validate(taxDetailIdParamSchema, 'params'), setPrimary);

// DELETE /api/company-tax-details/:id - Remove company tax detail
router.delete('/:id', validate(taxDetailIdParamSchema, 'params'), deleteTaxDetail);

export default router;
