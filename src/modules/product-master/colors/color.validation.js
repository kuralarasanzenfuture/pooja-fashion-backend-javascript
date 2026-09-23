import { z } from 'zod';

export const createColorSchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number'),
  color_code: z
    .string()
    .trim()
    .min(1, 'Color code must be at least 1 character')
    .max(50, 'Color code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Color code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  color_name: z
    .string()
    .trim()
    .min(1, 'Color name is required')
    .max(100, 'Color name cannot exceed 100 characters'),
  hex_code: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Hex code must be a valid 6-character hex color code (e.g., #FFFFFF)')
    .transform((val) => val.toUpperCase())
    .nullable()
    .optional(),
  description: z.string().trim().nullable().optional(),
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

export const updateColorSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  color_code: z
    .string()
    .trim()
    .min(1, 'Color code must be at least 1 character')
    .max(50, 'Color code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Color code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  color_name: z
    .string()
    .trim()
    .min(1, 'Color name must be at least 1 character')
    .max(100, 'Color name cannot exceed 100 characters')
    .optional(),
  hex_code: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Hex code must be a valid 6-character hex color code (e.g., #FFFFFF)')
    .transform((val) => val.toUpperCase())
    .nullable()
    .optional(),
  description: z.string().trim().nullable().optional(),
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

export const colorIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Color ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const colorCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  colorCode: z.string().trim().min(1, 'Color code is required'),
});

export const getColorsQuerySchema = z.object({
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
    .enum(['id', 'color_code', 'color_name', 'display_order', 'created_at', 'is_active'])
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createColorSchema,
  updateColorSchema,
  updateStatusSchema,
  colorIdParamSchema,
  companyIdParamSchema,
  colorCodeParamSchema,
  getColorsQuerySchema,
};
