import { z } from 'zod';

export const createBranchContactSchema = z.object({
  branch_id: z.coerce.number().int().positive('Branch ID must be a positive integer'),
  contact_name: z
    .string()
    .trim()
    .min(2, 'Contact name must be at least 2 characters')
    .max(150, 'Contact name cannot exceed 150 characters'),
  designation: z.string().trim().max(100).nullable().optional(),
  email: z.string().trim().email('Invalid email address').max(150).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  mobile: z.string().trim().max(30).nullable().optional(),
  is_primary: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(false),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(true),
});

export const updateBranchContactSchema = createBranchContactSchema
  .omit({ branch_id: true })
  .partial();

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

export const branchContactIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Branch contact ID must be a positive integer'),
});

export const branchIdParamSchema = z.object({
  branchId: z.coerce.number().int().positive('Branch ID must be a positive integer'),
});

export const getBranchContactsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  branch_id: z.coerce.number().int().positive().optional(),
  designation: z.string().trim().optional(),
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
      'contact_name',
      'designation',
      'email',
      'phone',
      'is_primary',
      'is_active',
      'created_at',
    ])
    .default('id'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createBranchContactSchema,
  updateBranchContactSchema,
  updateStatusSchema,
  branchContactIdParamSchema,
  branchIdParamSchema,
  getBranchContactsQuerySchema,
};
