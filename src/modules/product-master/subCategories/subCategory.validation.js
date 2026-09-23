import { z } from 'zod';

export const createSubcategorySchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number'),
  category_id: z.coerce
    .number()
    .int('Category ID must be an integer')
    .positive('Category ID must be a positive number'),
  subcategory_code: z
    .string()
    .trim()
    .min(1, 'Subcategory code must be at least 1 character')
    .max(50, 'Subcategory code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Subcategory code must contain only letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  subcategory_name: z
    .string()
    .trim()
    .min(1, 'Subcategory name is required')
    .max(150, 'Subcategory name cannot exceed 150 characters'),
  description: z.string().trim().max(2000).nullable().optional(),
  image_url: z.string().trim().nullable().optional(),
  image_key: z.string().trim().max(500).nullable().optional(),
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

export const updateSubcategorySchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  category_id: z.coerce.number().int().positive().optional(),
  subcategory_code: z
    .string()
    .trim()
    .min(1, 'Subcategory code must be at least 1 character')
    .max(50, 'Subcategory code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Subcategory code must contain only letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  subcategory_name: z
    .string()
    .trim()
    .min(1, 'Subcategory name must be at least 1 character')
    .max(150, 'Subcategory name cannot exceed 150 characters')
    .optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  image_url: z.string().trim().nullable().optional(),
  image_key: z.string().trim().max(500).nullable().optional(),
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

export const subcategoryIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Subcategory ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const categoryIdParamSchema = z.object({
  categoryId: z.coerce.number().int().positive('Category ID must be a positive integer'),
});

export const subcategoryCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  subcategoryCode: z.string().trim().min(1, 'Subcategory code is required'),
});

export const getSubcategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  category_id: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(['id', 'subcategory_code', 'subcategory_name', 'display_order', 'created_at', 'is_active'])
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createSubcategorySchema,
  updateSubcategorySchema,
  updateStatusSchema,
  subcategoryIdParamSchema,
  companyIdParamSchema,
  categoryIdParamSchema,
  subcategoryCodeParamSchema,
  getSubcategoriesQuerySchema,
};
