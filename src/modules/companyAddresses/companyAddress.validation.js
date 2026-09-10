import { z } from 'zod';

export const addressTypeEnum = z.enum([
  'registered',
  'head_office',
  'billing',
  'warehouse',
  'other',
]);

export const createCompanyAddressSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  address_type: addressTypeEnum,
  address_line_1: z
    .string()
    .trim()
    .min(1, 'Address line 1 is required')
    .max(255, 'Address line 1 cannot exceed 255 characters'),
  address_line_2: z.string().trim().max(255).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  district: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  postal_code: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().max(100).default('India'),
  landmark: z.string().trim().max(255).nullable().optional(),
  is_primary: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const updateCompanyAddressSchema = createCompanyAddressSchema.partial();

export const updateStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});

export const addressIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Address ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const getCompanyAddressesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  address_type: addressTypeEnum.optional(),
  is_primary: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  is_active: z
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
      'company_id',
      'address_type',
      'city',
      'state',
      'postal_code',
      'created_at',
      'is_primary',
      'is_active',
    ])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export default {
  addressTypeEnum,
  createCompanyAddressSchema,
  updateCompanyAddressSchema,
  updateStatusSchema,
  addressIdParamSchema,
  companyIdParamSchema,
  getCompanyAddressesQuerySchema,
};
