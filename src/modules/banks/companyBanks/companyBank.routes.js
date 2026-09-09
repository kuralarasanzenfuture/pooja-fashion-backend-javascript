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
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createCompanyBankSchema,
  updateCompanyBankSchema,
  updateStatusSchema,
  bankIdParamSchema,
  companyIdParamSchema,
  getCompanyBanksQuerySchema,
} from './companyBank.validation.js';

const router = Router();

// GET /api/company-banks - List company bank accounts with pagination & filters
router.get('/', validate(getCompanyBanksQuerySchema, 'query'), getAll);

// GET /api/company-banks/company/:companyId - List all bank accounts for a specific company
router.get('/company/:companyId', validate(companyIdParamSchema, 'params'), getByCompanyId);

// GET /api/company-banks/:id - Retrieve company bank account by ID
router.get('/:id', validate(bankIdParamSchema, 'params'), getById);

// POST /api/company-banks - Create new company bank account
router.post('/', validate(createCompanyBankSchema, 'body'), create);

// PUT /api/company-banks/:id - Update existing company bank account
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

// PATCH /api/company-banks/:id/primary - Set bank account as primary
router.patch('/:id/primary', validate(bankIdParamSchema, 'params'), setPrimary);

// DELETE /api/company-banks/:id - Remove company bank account
router.delete('/:id', validate(bankIdParamSchema, 'params'), deleteBank);

export default router;
