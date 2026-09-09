import { z } from 'zod';

export const bankTypeEnum = z.enum([
  'commercial',
  'cooperative',
  'regional_rural',
  'small_finance',
  'payments',
  'foreign',
  'other',
]);

export const createBankSchema = z.object({
  bank_code: z
    .string()
    .trim()
    .min(2, 'Bank code must be at least 2 characters')
    .max(50, 'Bank code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Bank code must only contain letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase()),
  bank_name: z
    .string()
    .trim()
    .min(2, 'Bank name must be at least 2 characters')
    .max(150, 'Bank name cannot exceed 150 characters'),
  short_name: z.string().trim().max(100).nullable().optional(),
  legal_name: z.string().trim().max(200).nullable().optional(),
  bank_type: bankTypeEnum.default('commercial'),
  logo_url: z.string().trim().nullable().optional(),
  logo_light_url: z.string().trim().nullable().optional(),
  logo_dark_url: z.string().trim().nullable().optional(),
  website_url: z.string().trim().nullable().optional(),
  country_code: z.string().trim().length(2, 'Country code must be 2 characters').default('IN'),
  is_active: z.boolean().default(true),
  is_verified: z.boolean().default(false),
  display_order: z.coerce.number().int().min(0, 'Display order must be >= 0').default(0),
  metadata: z.record(z.any()).nullable().optional(),
});

export const updateBankSchema = createBankSchema.partial();

export const updateStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});

export const bankIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Bank ID must be a positive integer'),
});

export const bankCodeParamSchema = z.object({
  bankCode: z.string().trim().min(1, 'Bank code is required'),
});

export const getBanksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  bank_type: bankTypeEnum.optional(),
  country_code: z.string().trim().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  is_verified: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      'id',
      'bank_code',
      'bank_name',
      'short_name',
      'bank_type',
      'display_order',
      'created_at',
      'is_active',
    ])
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  bankTypeEnum,
  createBankSchema,
  updateBankSchema,
  updateStatusSchema,
  bankIdParamSchema,
  bankCodeParamSchema,
  getBanksQuerySchema,
};
