import { z } from 'zod';

export const bankTypeEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase().replace(/[-\s]+/g, '_') : val),
  z.enum(
    [
      'commercial',
      'cooperative',
      'regional_rural',
      'small_finance',
      'payments',
      'foreign',
      'other',
    ],
    {
      errorMap: () => ({
        message:
          'Invalid bank type. Allowed: commercial, cooperative, regional_rural, small_finance, payments, foreign, other',
      }),
    }
  )
);

const optionalTrimmedString = (maxLen) =>
  z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    if (typeof val === 'string') {
      const t = val.trim();
      return t.length > 0 ? t : null;
    }
    return val;
  }, z.string().max(maxLen).nullable().optional());

const booleanCoerce = (defaultValue) =>
  z.preprocess((val) => {
    if (val === undefined) return defaultValue;
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1' || val === 1) return true;
    if (val === 'false' || val === '0' || val === 0) return false;
    return val;
  }, defaultValue !== undefined ? z.boolean().default(defaultValue) : z.boolean().optional());

const normalizeBankPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };

  if (n.bankCode !== undefined && n.bank_code === undefined) n.bank_code = n.bankCode;
  if (n.bankName !== undefined && n.bank_name === undefined) n.bank_name = n.bankName;
  if (n.shortName !== undefined && n.short_name === undefined) n.short_name = n.shortName;
  if (n.legalName !== undefined && n.legal_name === undefined) n.legal_name = n.legalName;
  if (n.bankType !== undefined && n.bank_type === undefined) n.bank_type = n.bankType;
  if (n.logoUrl !== undefined && n.logo_url === undefined) n.logo_url = n.logoUrl;
  if (n.logoLightUrl !== undefined && n.logo_light_url === undefined) n.logo_light_url = n.logoLightUrl;
  if (n.logoDarkUrl !== undefined && n.logo_dark_url === undefined) n.logo_dark_url = n.logoDarkUrl;
  if (n.websiteUrl !== undefined && n.website_url === undefined) n.website_url = n.websiteUrl;
  if (n.countryCode !== undefined && n.country_code === undefined) n.country_code = n.countryCode;
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;
  if (n.isVerified !== undefined && n.is_verified === undefined) n.is_verified = n.isVerified;
  if (n.displayOrder !== undefined && n.display_order === undefined) n.display_order = n.displayOrder;

  return n;
};

const baseCreateBankSchema = z.object({
  bank_code: z
    .string({ required_error: 'Bank code is required' })
    .trim()
    .min(2, 'Bank code must be at least 2 characters')
    .max(50, 'Bank code cannot exceed 50 characters')
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Bank code must only contain letters, numbers, hyphens, and underscores'
    )
    .transform((val) => val.toUpperCase()),
  bank_name: z
    .string({ required_error: 'Bank name is required' })
    .trim()
    .min(2, 'Bank name must be at least 2 characters')
    .max(150, 'Bank name cannot exceed 150 characters'),
  short_name: optionalTrimmedString(100),
  legal_name: optionalTrimmedString(200),
  bank_type: bankTypeEnum.default('commercial'),
  logo_url: optionalTrimmedString(1000),
  logo_light_url: optionalTrimmedString(1000),
  logo_dark_url: optionalTrimmedString(1000),
  website_url: optionalTrimmedString(1000),
  country_code: z.string().trim().length(2, 'Country code must be 2 characters').default('IN'),
  is_active: booleanCoerce(true),
  is_verified: booleanCoerce(false),
  display_order: z.coerce.number().int().min(0, 'Display order must be >= 0').default(0),
  metadata: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    }, z.record(z.any()))
    .nullable()
    .optional(),
});

export const createBankSchema = z.preprocess(normalizeBankPayload, baseCreateBankSchema);
export const updateBankSchema = z.preprocess(normalizeBankPayload, baseCreateBankSchema.partial());

const normalizeStatusPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;
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

export const deleteLogoQuerySchema = z.object({
  type: z.enum(['logo', 'logo_light', 'logo_dark', 'all']).default('all').optional(),
});

export const bankIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Bank ID must be a positive integer'),
});

export const bankCodeParamSchema = z.object({
  bankCode: z.string().trim().min(1, 'Bank code is required'),
});

const normalizeQueryPayload = (query) => {
  if (!query || typeof query !== 'object') return query;
  const n = { ...query };
  if (n.bankType !== undefined && n.bank_type === undefined) n.bank_type = n.bankType;
  if (n.countryCode !== undefined && n.country_code === undefined) n.country_code = n.countryCode;
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;
  if (n.isVerified !== undefined && n.is_verified === undefined) n.is_verified = n.isVerified;

  ['bank_type', 'country_code', 'is_active', 'is_verified', 'search'].forEach((key) => {
    if (n[key] === '') delete n[key];
  });
  return n;
};

export const getBanksQuerySchema = z.preprocess(
  normalizeQueryPayload,
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    bank_type: bankTypeEnum.optional(),
    country_code: z.string().trim().optional(),
    is_active: z
      .preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (val === 'true' || val === '1' || val === 1) return true;
        if (val === 'false' || val === '0' || val === 0) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    is_verified: z
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
        'bank_code',
        'bankCode',
        'bank_name',
        'bankName',
        'short_name',
        'shortName',
        'bank_type',
        'bankType',
        'display_order',
        'displayOrder',
        'created_at',
        'createdAt',
        'is_active',
        'isActive',
      ])
      .default('display_order'),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
  })
);

export default {
  bankTypeEnum,
  createBankSchema,
  updateBankSchema,
  updateStatusSchema,
  bankIdParamSchema,
  bankCodeParamSchema,
  getBanksQuerySchema,
  deleteLogoQuerySchema,
};
