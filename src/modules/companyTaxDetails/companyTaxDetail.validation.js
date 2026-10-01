import { z } from 'zod';

export const gstRegistrationTypeEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase().replace(/[-\s]+/g, '_') : val),
  z.enum(['regular', 'composition', 'unregistered', 'other'], {
    errorMap: () => ({
      message: 'Invalid GST registration type. Allowed: regular, composition, unregistered, other',
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

const booleanCoerce = (defaultValue = true) =>
  z.preprocess((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1' || val === 1) return true;
    if (val === 'false' || val === '0' || val === 0) return false;
    if (val === undefined || val === null || val === '') return defaultValue;
    return val;
  }, z.boolean());

const normalizeTaxPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };

  if (n.companyId !== undefined && n.company_id === undefined) {
    n.company_id = n.companyId;
  }
  if (n.panNumber !== undefined && n.pan_number === undefined) {
    n.pan_number = n.panNumber;
  }
  if (n.tanNumber !== undefined && n.tan_number === undefined) {
    n.tan_number = n.tanNumber;
  }
  if (n.gstRegistrationType !== undefined && n.gst_registration_type === undefined) {
    n.gst_registration_type = n.gstRegistrationType;
  }
  if (n.gstStateCode !== undefined && n.gst_state_code === undefined) {
    n.gst_state_code = n.gstStateCode;
  }
  if (n.taxRegisteredName !== undefined && n.tax_registered_name === undefined) {
    n.tax_registered_name = n.taxRegisteredName;
  }
  if (n.isPrimary !== undefined && n.is_primary === undefined) {
    n.is_primary = n.isPrimary;
  }
  if (n.isActive !== undefined && n.is_active === undefined) {
    n.is_active = n.isActive;
  }

  return n;
};

const baseCreateTaxDetailSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  gstin: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim().toUpperCase();
        return trimmed.length > 0 ? trimmed : null;
      }
      return val ?? null;
    })
    .pipe(z.string().max(20, 'GSTIN cannot exceed 20 characters').nullable().optional()),
  pan_number: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim().toUpperCase();
        return trimmed.length > 0 ? trimmed : null;
      }
      return val ?? null;
    })
    .pipe(z.string().max(20, 'PAN number cannot exceed 20 characters').nullable().optional()),
  tan_number: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim().toUpperCase();
        return trimmed.length > 0 ? trimmed : null;
      }
      return val ?? null;
    })
    .pipe(z.string().max(20, 'TAN number cannot exceed 20 characters').nullable().optional()),
  gst_registration_type: gstRegistrationTypeEnum.nullable().optional().default('regular'),
  gst_state_code: optionalTrimmedString(10, 'GST state code'),
  tax_registered_name: optionalTrimmedString(250, 'Tax registered name'),
  is_primary: booleanCoerce(true),
  is_active: booleanCoerce(true),
});

export const createCompanyTaxDetailSchema = z.preprocess(
  normalizeTaxPayload,
  baseCreateTaxDetailSchema
);

export const updateCompanyTaxDetailSchema = z.preprocess(
  normalizeTaxPayload,
  baseCreateTaxDetailSchema.partial()
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

export const taxDetailIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Tax detail ID must be a positive integer'),
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
  if (n.gstRegistrationType !== undefined && n.gst_registration_type === undefined) {
    n.gst_registration_type = n.gstRegistrationType;
  }
  if (n.isPrimary !== undefined && n.is_primary === undefined) {
    n.is_primary = n.isPrimary;
  }
  if (n.isActive !== undefined && n.is_active === undefined) {
    n.is_active = n.isActive;
  }

  ['company_id', 'gst_registration_type', 'is_primary', 'is_active', 'search'].forEach((key) => {
    if (n[key] === '') delete n[key];
  });

  return n;
};

export const getCompanyTaxDetailsQuerySchema = z.preprocess(
  normalizeQueryPayload,
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    company_id: z.coerce.number().int().positive().optional(),
    gst_registration_type: gstRegistrationTypeEnum.optional(),
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
        'gstin',
        'pan_number',
        'panNumber',
        'tan_number',
        'tanNumber',
        'gst_registration_type',
        'gstRegistrationType',
        'tax_registered_name',
        'taxRegisteredName',
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
  gstRegistrationTypeEnum,
  createCompanyTaxDetailSchema,
  updateCompanyTaxDetailSchema,
  updateStatusSchema,
  taxDetailIdParamSchema,
  companyIdParamSchema,
  getCompanyTaxDetailsQuerySchema,
};
