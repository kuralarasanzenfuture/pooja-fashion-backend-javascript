import { z } from 'zod';

export const createSizeGroupSchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number'),
  size_group_code: z
    .string()
    .trim()
    .min(1, 'Size group code must be at least 1 character')
    .max(50, 'Size group code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Size group code must contain only letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  size_group_name: z
    .string()
    .trim()
    .min(1, 'Size group name is required')
    .max(100, 'Size group name cannot exceed 100 characters'),
  description: z.string().trim().max(2000).nullable().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateSizeGroupSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  size_group_code: z
    .string()
    .trim()
    .min(1, 'Size group code must be at least 1 character')
    .max(50, 'Size group code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Size group code must contain only letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  size_group_name: z
    .string()
    .trim()
    .min(1, 'Size group name must be at least 1 character')
    .max(100, 'Size group name cannot exceed 100 characters')
    .optional(),
  description: z.string().trim().max(2000).nullable().optional(),
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

export const sizeGroupIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Size Group ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const sizeGroupCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  sizeGroupCode: z.string().trim().min(1, 'Size group code is required'),
});

export const getSizeGroupsQuerySchema = z.object({
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
    .enum(['id', 'size_group_code', 'size_group_name', 'created_at', 'is_active'])
    .default('size_group_name'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createSizeGroupSchema,
  updateSizeGroupSchema,
  updateStatusSchema,
  sizeGroupIdParamSchema,
  companyIdParamSchema,
  sizeGroupCodeParamSchema,
  getSizeGroupsQuerySchema,
};
