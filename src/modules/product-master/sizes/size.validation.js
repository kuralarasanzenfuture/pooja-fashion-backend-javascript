import { z } from 'zod';

export const createSizeSchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number'),
  size_group_id: z.coerce
    .number()
    .int('Size Group ID must be an integer')
    .positive('Size Group ID must be a positive number'),
  size_code: z
    .string()
    .trim()
    .min(1, 'Size code must be at least 1 character')
    .max(50, 'Size code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Size code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  size_name: z
    .string()
    .trim()
    .min(1, 'Size name is required')
    .max(100, 'Size name cannot exceed 100 characters'),
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

export const updateSizeSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  size_group_id: z.coerce.number().int().positive().optional(),
  size_code: z
    .string()
    .trim()
    .min(1, 'Size code must be at least 1 character')
    .max(50, 'Size code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Size code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  size_name: z
    .string()
    .trim()
    .min(1, 'Size name must be at least 1 character')
    .max(100, 'Size name cannot exceed 100 characters')
    .optional(),
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

export const sizeIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Size ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const sizeGroupIdParamSchema = z.object({
  sizeGroupId: z.coerce.number().int().positive('Size Group ID must be a positive integer'),
});

export const sizeCodeParamSchema = z.object({
  sizeGroupId: z.coerce.number().int().positive('Size Group ID must be a positive integer'),
  sizeCode: z.string().trim().min(1, 'Size code is required'),
});

export const getSizesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  size_group_id: z.coerce.number().int().positive().optional(),
  sizeGroupId: z.coerce.number().int().positive().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(['id', 'size_code', 'size_name', 'display_order', 'created_at', 'is_active'])
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createSizeSchema,
  updateSizeSchema,
  updateStatusSchema,
  sizeIdParamSchema,
  companyIdParamSchema,
  sizeGroupIdParamSchema,
  sizeCodeParamSchema,
  getSizesQuerySchema,
};
