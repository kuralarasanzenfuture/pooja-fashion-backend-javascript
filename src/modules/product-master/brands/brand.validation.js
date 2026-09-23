import { z } from 'zod';

export const createBrandSchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number'),
  brand_code: z
    .string()
    .trim()
    .min(1, 'Brand code must be at least 1 character')
    .max(50, 'Brand code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Brand code must contain only letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  brand_name: z
    .string()
    .trim()
    .min(1, 'Brand name is required')
    .max(150, 'Brand name cannot exceed 150 characters'),
  description: z.string().trim().max(2000).nullable().optional(),
  logo_url: z.string().trim().nullable().optional(),
  logo_key: z.string().trim().max(500).nullable().optional(),
  website_url: z.string().trim().url('Website URL must be a valid URL').max(255).nullable().optional().or(z.literal('')),
  display_order: z.coerce
    .number()
    .int('Display order must be an integer')
    .min(0, 'Display order must be >= 0')
    .default(0),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateBrandSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  brand_code: z
    .string()
    .trim()
    .min(1, 'Brand code must be at least 1 character')
    .max(50, 'Brand code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Brand code must contain only letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  brand_name: z
    .string()
    .trim()
    .min(1, 'Brand name must be at least 1 character')
    .max(150, 'Brand name cannot exceed 150 characters')
    .optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  logo_url: z.string().trim().nullable().optional(),
  logo_key: z.string().trim().max(500).nullable().optional(),
  website_url: z.string().trim().url('Website URL must be a valid URL').max(255).nullable().optional().or(z.literal('')),
  display_order: z.coerce
    .number()
    .int('Display order must be an integer')
    .min(0, 'Display order must be >= 0')
    .optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .optional(),
  updated_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateStatusSchema = z.object({
  is_active: z.preprocess(
    (val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    },
    z.boolean({ required_error: 'is_active is required' })
  ),
});

export const brandIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Brand ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const brandCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  brandCode: z.string().trim().min(1, 'Brand code is required'),
});

export const getBrandsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(['id', 'brand_code', 'brand_name', 'display_order', 'created_at', 'is_active'])
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createBrandSchema,
  updateBrandSchema,
  updateStatusSchema,
  brandIdParamSchema,
  companyIdParamSchema,
  brandCodeParamSchema,
  getBrandsQuerySchema,
};
