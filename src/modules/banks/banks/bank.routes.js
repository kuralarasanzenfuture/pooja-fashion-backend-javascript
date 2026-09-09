import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  create,
  update,
  updateStatus,
  deleteBank,
} from './bank.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createBankSchema,
  updateBankSchema,
  updateStatusSchema,
  bankIdParamSchema,
  bankCodeParamSchema,
  getBanksQuerySchema,
} from './bank.validation.js';

const router = Router();

// GET /api/banks - List banks with pagination & filters
router.get('/', validate(getBanksQuerySchema, 'query'), getAll);

// GET /api/banks/code/:bankCode - Retrieve bank by bank code
router.get('/code/:bankCode', validate(bankCodeParamSchema, 'params'), getByCode);

// GET /api/banks/:id - Retrieve bank by primary ID
router.get('/:id', validate(bankIdParamSchema, 'params'), getById);

// POST /api/banks - Create new bank
router.post('/', validate(createBankSchema, 'body'), create);

// PUT /api/banks/:id - Update existing bank
router.put(
  '/:id',
  validate(bankIdParamSchema, 'params'),
  validate(updateBankSchema, 'body'),
  update
);

// PATCH /api/banks/:id/status - Update bank status
router.patch(
  '/:id/status',
  validate(bankIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/banks/:id - Remove bank
router.delete('/:id', validate(bankIdParamSchema, 'params'), deleteBank);

export default router;
