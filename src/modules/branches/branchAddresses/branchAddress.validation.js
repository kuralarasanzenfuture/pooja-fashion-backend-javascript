import { z } from 'zod';

export const createBranchAddressSchema = z.object({
  branch_id: z.coerce.number().int().positive('Branch ID must be a positive integer'),
  address_line_1: z
    .string()
    .trim()
    .min(2, 'Address line 1 must be at least 2 characters')
    .max(255, 'Address line 1 cannot exceed 255 characters'),
  address_line_2: z.string().trim().max(255).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  district: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  postal_code: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().max(100).default('India'),
  landmark: z.string().trim().max(255).nullable().optional(),
  is_primary: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(true),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(true),
});

export const updateBranchAddressSchema = createBranchAddressSchema
  .omit({ branch_id: true })
  .partial();

export const updateStatusSchema = z.object({
  is_active: z.preprocess((val) => {
    if (val === 'true' || val === true || val === 1 || val === '1') return true;
    if (val === 'false' || val === false || val === 0 || val === '0') return false;
    return val;
  }, z.boolean({ required_error: 'is_active is required' })),
});

export const branchAddressIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Branch address ID must be a positive integer'),
});

export const branchIdParamSchema = z.object({
  branchId: z.coerce.number().int().positive('Branch ID must be a positive integer'),
});

export const getBranchAddressesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  branch_id: z.coerce.number().int().positive().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
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
    .enum(['id', 'city', 'state', 'postal_code', 'is_primary', 'is_active', 'created_at'])
    .default('id'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createBranchAddressSchema,
  updateBranchAddressSchema,
  updateStatusSchema,
  branchAddressIdParamSchema,
  branchIdParamSchema,
  getBranchAddressesQuerySchema,
};
