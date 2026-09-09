import { Router } from 'express';
import {
  getAll,
  getById,
  getByBankId,
  getByValue,
  create,
  update,
  updateStatus,
  deleteIdentifier,
} from './bankIdentifier.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createBankIdentifierSchema,
  updateBankIdentifierSchema,
  updateStatusSchema,
  identifierIdParamSchema,
  bankIdParamSchema,
  identifierValueParamSchema,
  getBankIdentifiersQuerySchema,
} from './bankIdentifier.validation.js';

const router = Router();

// GET /api/bank-identifiers - List identifiers with pagination & filters
router.get('/', validate(getBankIdentifiersQuerySchema, 'query'), getAll);

// GET /api/bank-identifiers/bank/:bankId - List all identifiers for a bank
router.get('/bank/:bankId', validate(bankIdParamSchema, 'params'), getByBankId);

// GET /api/bank-identifiers/value/:identifierValue - Lookup identifier by code value (e.g. IFSC)
router.get('/value/:identifierValue', validate(identifierValueParamSchema, 'params'), getByValue);

// GET /api/bank-identifiers/:id - Retrieve identifier by ID
router.get('/:id', validate(identifierIdParamSchema, 'params'), getById);

// POST /api/bank-identifiers - Create new bank identifier
router.post('/', validate(createBankIdentifierSchema, 'body'), create);

// PUT /api/bank-identifiers/:id - Update existing bank identifier
router.put(
  '/:id',
  validate(identifierIdParamSchema, 'params'),
  validate(updateBankIdentifierSchema, 'body'),
  update
);

// PATCH /api/bank-identifiers/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(identifierIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/bank-identifiers/:id - Remove bank identifier
router.delete('/:id', validate(identifierIdParamSchema, 'params'), deleteIdentifier);

export default router;
