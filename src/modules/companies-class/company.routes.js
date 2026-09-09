import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  create,
  update,
  updateStatus,
  deleteCompany,
} from './company.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createCompanySchema,
  updateCompanySchema,
  updateStatusSchema,
  companyIdParamSchema,
  companyCodeParamSchema,
  getCompaniesQuerySchema,
} from './company.validation.js';

const router = Router();

// GET /api/companies - List companies with pagination & filters
router.get('/', validate(getCompaniesQuerySchema, 'query'), getAll);

// GET /api/companies/code/:companyCode - Retrieve company by unique company code
router.get('/code/:companyCode', validate(companyCodeParamSchema, 'params'), getByCode);

// GET /api/companies/:id - Retrieve company by primary ID
router.get('/:id', validate(companyIdParamSchema, 'params'), getById);

// POST /api/companies - Create new company
router.post('/', validate(createCompanySchema, 'body'), create);

// PUT /api/companies/:id - Update existing company
router.put(
  '/:id',
  validate(companyIdParamSchema, 'params'),
  validate(updateCompanySchema, 'body'),
  update
);

// PATCH /api/companies/:id/status - Update company status
router.patch(
  '/:id/status',
  validate(companyIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/companies/:id - Remove company
router.delete('/:id', validate(companyIdParamSchema, 'params'), deleteCompany);

export default router;
