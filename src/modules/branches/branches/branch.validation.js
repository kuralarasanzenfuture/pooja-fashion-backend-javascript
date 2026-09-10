import { z } from 'zod';

export const branchTypeEnum = z.enum([
  'head_office',
  'store',
  'warehouse',
  'office',
  'showroom',
  'other',
]);

export const branchStatusEnum = z.enum(['active', 'inactive', 'closed']);

export const createBranchSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  branch_code: z
    .string()
    .trim()
    .min(2, 'Branch code must be at least 2 characters')
    .max(50, 'Branch code cannot exceed 50 characters')
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Branch code must only contain letters, numbers, hyphens, and underscores'
    )
    .transform((val) => val.toUpperCase())
    .optional(),
  branch_name: z
    .string()
    .trim()
    .min(2, 'Branch name must be at least 2 characters')
    .max(200, 'Branch name cannot exceed 200 characters'),
  branch_type: branchTypeEnum.default('store'),
  email: z.string().trim().email('Invalid email address').max(150).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  mobile: z.string().trim().max(30).nullable().optional(),
  manager_name: z.string().trim().max(150).nullable().optional(),
  opening_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Opening date must be in YYYY-MM-DD format')
    .nullable()
    .optional(),
  is_main_branch: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(false),
  status: branchStatusEnum.default('active'),
});

export const updateBranchSchema = createBranchSchema.omit({ company_id: true }).partial();

export const updateStatusSchema = z.object({
  status: branchStatusEnum,
});

export const branchIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Branch ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const branchCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  branchCode: z.string().trim().min(1, 'Branch code is required'),
});

export const getBranchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  branch_type: branchTypeEnum.optional(),
  status: branchStatusEnum.optional(),
  is_main_branch: z
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
      'branch_code',
      'branch_name',
      'branch_type',
      'manager_name',
      'opening_date',
      'status',
      'created_at',
    ])
    .default('id'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  branchTypeEnum,
  branchStatusEnum,
  createBranchSchema,
  updateBranchSchema,
  updateStatusSchema,
  branchIdParamSchema,
  companyIdParamSchema,
  branchCodeParamSchema,
  getBranchesQuerySchema,
};
