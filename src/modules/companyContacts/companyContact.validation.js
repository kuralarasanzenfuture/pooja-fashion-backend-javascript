import { z } from 'zod';

export const contactTypeEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase().replace(/[-\s]+/g, '_') : val),
  z.enum(['owner', 'manager', 'accountant', 'sales', 'support', 'other'], {
    errorMap: () => ({
      message: 'Invalid contact type. Allowed: owner, manager, accountant, sales, support, other',
    }),
  })
);

const optionalTrimmedString = (maxLen, fieldName) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      return val ?? null;
    })
    .pipe(
      z
        .string()
        .max(maxLen, `${fieldName} cannot exceed ${maxLen} characters`)
        .nullable()
        .optional()
    );

const booleanCoerce = (defaultValue = false) =>
  z.preprocess((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1' || val === 1) return true;
    if (val === 'false' || val === '0' || val === 0) return false;
    if (val === undefined || val === null || val === '') return defaultValue;
    return val;
  }, z.boolean());

const normalizeContactPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };

  if (n.companyId !== undefined && n.company_id === undefined) {
    n.company_id = n.companyId;
  }
  if (n.contactType !== undefined && n.contact_type === undefined) {
    n.contact_type = n.contactType;
  }
  if (n.contactName !== undefined && n.contact_name === undefined) {
    n.contact_name = n.contactName;
  }
  if (n.isPrimary !== undefined && n.is_primary === undefined) {
    n.is_primary = n.isPrimary;
  }
  if (n.isActive !== undefined && n.is_active === undefined) {
    n.is_active = n.isActive;
  }

  return n;
};

const baseCreateContactSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  contact_type: contactTypeEnum,
  contact_name: z
    .string({ required_error: 'Contact name is required' })
    .trim()
    .min(1, 'Contact name is required')
    .max(150, 'Contact name cannot exceed 150 characters'),
  designation: optionalTrimmedString(100, 'Designation'),
  email: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      return val ?? null;
    })
    .pipe(z.string().email('Invalid email address').max(150).nullable().optional()),
  phone: optionalTrimmedString(30, 'Phone'),
  mobile: optionalTrimmedString(30, 'Mobile'),
  is_primary: booleanCoerce(false),
  is_active: booleanCoerce(true),
});

export const createCompanyContactSchema = z.preprocess(
  normalizeContactPayload,
  baseCreateContactSchema
);

export const updateCompanyContactSchema = z.preprocess(
  normalizeContactPayload,
  baseCreateContactSchema.partial()
);

const normalizeStatusPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };

  if (n.isActive !== undefined && n.is_active === undefined) {
    n.is_active = n.isActive;
  }
  if (n.status !== undefined && n.is_active === undefined) {
    if (typeof n.status === 'string') {
      n.is_active = n.status.toLowerCase() === 'active';
    } else {
      n.is_active = Boolean(n.status);
    }
  }
  return n;
};

export const updateStatusSchema = z.preprocess(
  normalizeStatusPayload,
  z.object({
    is_active: z.preprocess((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true' || val === '1' || val === 1) return true;
      if (val === 'false' || val === '0' || val === 0) return false;
      return val;
    }, z.boolean({ required_error: 'is_active is required' })),
  })
);

export const contactIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Contact ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

const normalizeQueryPayload = (query) => {
  if (!query || typeof query !== 'object') return query;
  const n = { ...query };

  if (n.companyId !== undefined && n.company_id === undefined) {
    n.company_id = n.companyId;
  }
  if (n.contactType !== undefined && n.contact_type === undefined) {
    n.contact_type = n.contactType;
  }
  if (n.isPrimary !== undefined && n.is_primary === undefined) {
    n.is_primary = n.isPrimary;
  }
  if (n.isActive !== undefined && n.is_active === undefined) {
    n.is_active = n.isActive;
  }

  ['company_id', 'contact_type', 'is_primary', 'is_active', 'search'].forEach((key) => {
    if (n[key] === '') delete n[key];
  });

  return n;
};

export const getCompanyContactsQuerySchema = z.preprocess(
  normalizeQueryPayload,
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    company_id: z.coerce.number().int().positive().optional(),
    contact_type: contactTypeEnum.optional(),
    is_primary: z
      .preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (val === 'true' || val === '1' || val === 1) return true;
        if (val === 'false' || val === '0' || val === 0) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    is_active: z
      .preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (val === 'true' || val === '1' || val === 1) return true;
        if (val === 'false' || val === '0' || val === 0) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    search: z.string().trim().optional(),
    sortBy: z
      .enum([
        'id',
        'company_id',
        'companyId',
        'contact_type',
        'contactType',
        'contact_name',
        'contactName',
        'designation',
        'email',
        'created_at',
        'createdAt',
        'is_primary',
        'isPrimary',
        'is_active',
        'isActive',
      ])
      .default('created_at'),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  })
);

export default {
  contactTypeEnum,
  createCompanyContactSchema,
  updateCompanyContactSchema,
  updateStatusSchema,
  contactIdParamSchema,
  companyIdParamSchema,
  getCompanyContactsQuerySchema,
};
