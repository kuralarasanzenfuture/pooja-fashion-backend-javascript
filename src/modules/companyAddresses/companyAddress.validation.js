import { z } from 'zod';

export const addressTypeEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase().replace(/[-\s]+/g, '_') : val),
  z.enum(['registered', 'head_office', 'billing', 'warehouse', 'other'], {
    errorMap: () => ({
      message:
        'Invalid address type. Allowed types: registered, head_office, billing, warehouse, other',
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

const normalizeAddressPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };

  if (n.companyId !== undefined && n.company_id === undefined) {
    n.company_id = n.companyId;
  }
  if (n.addressType !== undefined && n.address_type === undefined) {
    n.address_type = n.addressType;
  }
  if (n.addressLine1 !== undefined && n.address_line_1 === undefined) {
    n.address_line_1 = n.addressLine1;
  }
  if (n.addressLine2 !== undefined && n.address_line_2 === undefined) {
    n.address_line_2 = n.addressLine2;
  }
  if (n.postalCode !== undefined && n.postal_code === undefined) {
    n.postal_code = n.postalCode;
  } else if (n.pincode !== undefined && n.postal_code === undefined) {
    n.postal_code = n.pincode;
  } else if (n.zipCode !== undefined && n.postal_code === undefined) {
    n.postal_code = n.zipCode;
  }
  if (n.isPrimary !== undefined && n.is_primary === undefined) {
    n.is_primary = n.isPrimary;
  }
  if (n.isActive !== undefined && n.is_active === undefined) {
    n.is_active = n.isActive;
  }

  return n;
};

const baseCreateAddressSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  address_type: addressTypeEnum,
  address_line_1: z
    .string({ required_error: 'Address line 1 is required' })
    .trim()
    .min(1, 'Address line 1 is required')
    .max(255, 'Address line 1 cannot exceed 255 characters'),
  address_line_2: optionalTrimmedString(255, 'Address line 2'),
  city: optionalTrimmedString(100, 'City'),
  district: optionalTrimmedString(100, 'District'),
  state: optionalTrimmedString(100, 'State'),
  postal_code: optionalTrimmedString(20, 'Postal code'),
  country: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : 'India';
      }
      return 'India';
    })
    .pipe(z.string().max(100, 'Country cannot exceed 100 characters'))
    .default('India'),
  landmark: optionalTrimmedString(255, 'Landmark'),
  is_primary: booleanCoerce(false),
  is_active: booleanCoerce(true),
});

export const createCompanyAddressSchema = z.preprocess(
  normalizeAddressPayload,
  baseCreateAddressSchema
);

export const updateCompanyAddressSchema = z.preprocess(
  normalizeAddressPayload,
  baseCreateAddressSchema.partial()
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

export const addressIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Address ID must be a positive integer'),
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
  if (n.addressType !== undefined && n.address_type === undefined) {
    n.address_type = n.addressType;
  }
  if (n.isPrimary !== undefined && n.is_primary === undefined) {
    n.is_primary = n.isPrimary;
  }
  if (n.isActive !== undefined && n.is_active === undefined) {
    n.is_active = n.isActive;
  }

  // Treat empty query strings as undefined
  ['company_id', 'address_type', 'is_primary', 'is_active', 'search'].forEach((key) => {
    if (n[key] === '') {
      delete n[key];
    }
  });

  return n;
};

export const getCompanyAddressesQuerySchema = z.preprocess(
  normalizeQueryPayload,
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    company_id: z.coerce.number().int().positive('Company ID must be a positive integer').optional(),
    address_type: addressTypeEnum.optional(),
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
        'company_name',
        'companyName',
        'address_type',
        'addressType',
        'address_line_1',
        'addressLine1',
        'city',
        'district',
        'state',
        'postal_code',
        'postalCode',
        'is_primary',
        'isPrimary',
        'is_active',
        'isActive',
        'created_at',
        'createdAt',
        'updated_at',
        'updatedAt',
      ])
      .default('created_at'),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  })
);

export default {
  addressTypeEnum,
  createCompanyAddressSchema,
  updateCompanyAddressSchema,
  updateStatusSchema,
  addressIdParamSchema,
  companyIdParamSchema,
  getCompanyAddressesQuerySchema,
};
