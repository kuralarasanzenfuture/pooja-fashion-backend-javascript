import { z } from 'zod';

export const contactTypeEnum = z.enum([
  'owner',
  'manager',
  'accountant',
  'sales',
  'support',
  'other',
]);

export const createCompanyContactSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  contact_type: contactTypeEnum,
  contact_name: z
    .string()
    .trim()
    .min(1, 'Contact name is required')
    .max(150, 'Contact name cannot exceed 150 characters'),
  designation: z.string().trim().max(100).nullable().optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150)
    .nullable()
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().max(30).nullable().optional(),
  mobile: z.string().trim().max(30).nullable().optional(),
  is_primary: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const updateCompanyContactSchema = createCompanyContactSchema.partial();

export const updateStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});

export const contactIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Contact ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const getCompanyContactsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  contact_type: contactTypeEnum.optional(),
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
      'contact_type',
      'contact_name',
      'designation',
      'email',
      'created_at',
      'is_primary',
      'is_active',
    ])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export default {
  contactTypeEnum,
  createCompanyContactSchema,
  updateCompanyContactSchema,
  updateStatusSchema,
  contactIdParamSchema,
  companyIdParamSchema,
  getCompanyContactsQuerySchema,
};
