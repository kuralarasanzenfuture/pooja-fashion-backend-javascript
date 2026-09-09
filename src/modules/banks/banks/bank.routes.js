import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  create,
  update,
  uploadLogo,
  deleteLogo,
  updateStatus,
  deleteBank,
} from './bank.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { bankLogoUploadFields } from '../../../middlewares/upload.middleware.js';
import { resolveBankContext } from './bank.middleware.js';
import {
  createBankSchema,
  updateBankSchema,
  updateStatusSchema,
  bankIdParamSchema,
  bankCodeParamSchema,
  getBanksQuerySchema,
  deleteLogoQuerySchema,
} from './bank.validation.js';

const router = Router();

// GET /api/banks - List banks with pagination & filters
router.get('/', validate(getBanksQuerySchema, 'query'), getAll);

// GET /api/banks/code/:bankCode - Retrieve bank by bank code
router.get('/code/:bankCode', validate(bankCodeParamSchema, 'params'), getByCode);

// GET /api/banks/:id - Retrieve bank by primary ID
router.get('/:id', validate(bankIdParamSchema, 'params'), getById);

// POST /api/banks - Create new bank (accepts JSON or multipart/form-data with logos)
router.post(
  '/',
  bankLogoUploadFields,
  validate(createBankSchema, 'body'),
  create
);

// PUT /api/banks/:id - Update existing bank (accepts JSON or multipart/form-data with logos)
router.put(
  '/:id',
  resolveBankContext,
  bankLogoUploadFields,
  validate(bankIdParamSchema, 'params'),
  validate(updateBankSchema, 'body'),
  update
);

// POST /api/banks/:id/logo - Dedicated endpoint to upload/replace logos
router.post(
  '/:id/logo',
  resolveBankContext,
  bankLogoUploadFields,
  validate(bankIdParamSchema, 'params'),
  uploadLogo
);

// DELETE /api/banks/:id/logo - Dedicated endpoint to remove logos from disk & DB
router.delete(
  '/:id/logo',
  validate(bankIdParamSchema, 'params'),
  validate(deleteLogoQuerySchema, 'query'),
  deleteLogo
);

// PATCH /api/banks/:id/status - Update bank status
router.patch(
  '/:id/status',
  validate(bankIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/banks/:id - Remove bank and its uploaded files
router.delete('/:id', validate(bankIdParamSchema, 'params'), deleteBank);

export default router;
