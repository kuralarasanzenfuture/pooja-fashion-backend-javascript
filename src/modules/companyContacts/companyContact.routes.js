import { Router } from 'express';
import {
  getAll,
  getById,
  getByCompanyId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteContact,
} from './companyContact.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createCompanyContactSchema,
  updateCompanyContactSchema,
  updateStatusSchema,
  contactIdParamSchema,
  companyIdParamSchema,
  getCompanyContactsQuerySchema,
} from './companyContact.validation.js';

const router = Router();

// GET /api/company-contacts - List contacts with pagination & filters
router.get('/', validate(getCompanyContactsQuerySchema, 'query'), getAll);

// GET /api/company-contacts/company/:companyId - List all contacts for a specific company
router.get('/company/:companyId', validate(companyIdParamSchema, 'params'), getByCompanyId);

// GET /api/company-contacts/:id - Retrieve contact by primary ID
router.get('/:id', validate(contactIdParamSchema, 'params'), getById);

// POST /api/company-contacts - Create new company contact
router.post('/', validate(createCompanyContactSchema, 'body'), create);

// PUT /api/company-contacts/:id - Update existing company contact
router.put(
  '/:id',
  validate(contactIdParamSchema, 'params'),
  validate(updateCompanyContactSchema, 'body'),
  update
);

// PATCH /api/company-contacts/:id/status - Update active status of contact
router.patch(
  '/:id/status',
  validate(contactIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// PATCH /api/company-contacts/:id/primary - Mark contact as primary
router.patch('/:id/primary', validate(contactIdParamSchema, 'params'), setPrimary);

// DELETE /api/company-contacts/:id - Remove company contact
router.delete('/:id', validate(contactIdParamSchema, 'params'), deleteContact);

export default router;
