import { Router } from 'express';
import {
  getAll,
  getById,
  getByCompanyId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteBank,
} from './companyBank.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createCompanyBankSchema,
  updateCompanyBankSchema,
  updateStatusSchema,
  bankIdParamSchema,
  companyIdParamSchema,
  getCompanyBanksQuerySchema,
} from './companyBank.validation.js';

const router = Router();

// GET /api/company-banks - List banks with pagination & filters
router.get('/', validate(getCompanyBanksQuerySchema, 'query'), getAll);

// GET /api/company-banks/company/:companyId - List all banks for a company
router.get('/company/:companyId', validate(companyIdParamSchema, 'params'), getByCompanyId);

// GET /api/company-banks/:id - Retrieve bank by ID
router.get('/:id', validate(bankIdParamSchema, 'params'), getById);

// POST /api/company-banks - Create new company bank
router.post('/', validate(createCompanyBankSchema, 'body'), create);

// PUT /api/company-banks/:id - Update existing company bank
router.put(
  '/:id',
  validate(bankIdParamSchema, 'params'),
  validate(updateCompanyBankSchema, 'body'),
  update
);

// PATCH /api/company-banks/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(bankIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// PATCH /api/company-banks/:id/primary - Set bank as primary
router.patch('/:id/primary', validate(bankIdParamSchema, 'params'), setPrimary);

// DELETE /api/company-banks/:id - Remove company bank
router.delete('/:id', validate(bankIdParamSchema, 'params'), deleteBank);

export default router;
