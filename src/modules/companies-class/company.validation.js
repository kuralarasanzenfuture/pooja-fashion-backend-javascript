import { z } from 'zod';

export const companyStatusEnum = z.enum(['active', 'inactive', 'suspended']);

export const createCompanySchema = z.object({
  company_code: z
    .string()
    .trim()
    .min(2, 'Company code must be at least 2 characters')
    .max(50, 'Company code cannot exceed 50 characters')
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Company code must only contain letters, numbers, hyphens, and underscores'
    )
    .transform((val) => val.toUpperCase()),
  company_name: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name cannot exceed 200 characters'),
  legal_name: z.string().trim().max(250).nullable().optional(),
  display_name: z.string().trim().max(200).nullable().optional(),
  business_type: z.string().trim().max(100).nullable().optional(),
  industry_type: z.string().trim().max(100).nullable().optional(),
  registration_number: z.string().trim().max(100).nullable().optional(),
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
  website: z.string().trim().max(255).nullable().optional(),
  logo_url: z.string().trim().nullable().optional(),
  default_currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter ISO code')
    .default('INR'),
  country_code: z
    .string()
    .trim()
    .length(2, 'Country code must be a 2-letter ISO code')
    .default('IN'),
  timezone: z.string().trim().max(100).default('Asia/Kolkata'),
  financial_year_start_month: z.coerce
    .number()
    .int()
    .min(1, 'Financial year start month must be between 1 and 12')
    .max(12, 'Financial year start month must be between 1 and 12')
    .default(4),
  status: companyStatusEnum.default('active'),
});

export const updateCompanySchema = createCompanySchema.partial();

export const updateStatusSchema = z.object({
  status: companyStatusEnum,
});

export const companyIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const companyCodeParamSchema = z.object({
  companyCode: z.string().trim().min(1, 'Company code is required'),
});

export const getCompaniesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: companyStatusEnum.optional(),
  sortBy: z
    .enum(['id', 'company_code', 'company_name', 'created_at', 'status'])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export default {
  createCompanySchema,
  updateCompanySchema,
  updateStatusSchema,
  companyIdParamSchema,
  companyCodeParamSchema,
  getCompaniesQuerySchema,
};
