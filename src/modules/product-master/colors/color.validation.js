import { z } from 'zod';

export const createColorSchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number')
    .optional(),
  color_code: z
    .string()
    .trim()
    .min(1, 'Color code must be at least 1 character')
    .max(50, 'Color code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Color code must contain only letters, numbers, hyphens, and underscores')
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
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Hex code must be a valid 6-character hex color (e.g. #FF0000)')
    .transform((val) => val.toUpperCase())
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  description: z.string().trim().max(2000).nullable().optional(),
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
    .regex(/^[A-Za-z0-9_-]+$/, 'Color code must contain only letters, numbers, hyphens, and underscores')
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
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Hex code must be a valid 6-character hex color (e.g. #FF0000)')
    .transform((val) => val.toUpperCase())
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  description: z.string().trim().max(2000).nullable().optional(),
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
  companyId: z.coerce.number().int().positive().optional(),
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
    .enum(['id', 'color_code', 'color_name', 'hex_code', 'display_order', 'created_at', 'is_active'])
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export const getAllColorsQuerySchema = z.object({
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
  sortBy: z.enum(['id', 'color_code', 'color_name', 'hex_code', 'display_order', 'created_at']).default('display_order'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export const getColorStatsQuerySchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
});

export const reorderColorsSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  items: z
    .array(
      z.object({
        id: z.coerce.number().int().positive('Item ID must be a positive integer'),
        display_order: z.coerce.number().int().min(0, 'display_order must be >= 0'),
      })
    )
    .min(1, 'At least one item is required for reordering'),
});

export const checkColorNameQuerySchema = z
  .object({
    company_id: z.coerce.number().int().positive().optional(),
    companyId: z.coerce.number().int().positive().optional(),
    name: z.string().trim().optional(),
    color_name: z.string().trim().optional(),
    excludeId: z.coerce.number().int().positive().optional(),
    exclude_id: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => (data.name && data.name.length > 0) || (data.color_name && data.color_name.length > 0), {
    message: 'Color name is required',
    path: ['name'],
  });

export const checkColorCodeQuerySchema = z
  .object({
    company_id: z.coerce.number().int().positive().optional(),
    companyId: z.coerce.number().int().positive().optional(),
    code: z.string().trim().optional(),
    color_code: z.string().trim().optional(),
    excludeId: z.coerce.number().int().positive().optional(),
    exclude_id: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => (data.code && data.code.length > 0) || (data.color_code && data.color_code.length > 0), {
    message: 'Color code is required',
    path: ['code'],
  });

export const seedDefaultColorsSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
});

export default {
  createColorSchema,
  updateColorSchema,
  updateStatusSchema,
  colorIdParamSchema,
  companyIdParamSchema,
  colorCodeParamSchema,
  getColorsQuerySchema,
  getAllColorsQuerySchema,
  getColorStatsQuerySchema,
  reorderColorsSchema,
  checkColorNameQuerySchema,
  checkColorCodeQuerySchema,
  seedDefaultColorsSchema,
};
