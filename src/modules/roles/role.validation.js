import { z } from 'zod';

export const createRoleSchema = z
  .object({
    company_id: z.coerce
      .number()
      .int()
      .positive('Company ID must be a positive integer')
      .nullable()
      .optional(),
    role_name: z
      .string()
      .trim()
      .min(2, 'Role name must be at least 2 characters')
      .max(100, 'Role name cannot exceed 100 characters'),
    role_code: z
      .string()
      .trim()
      .min(2, 'Role code must be at least 2 characters')
      .max(50, 'Role code cannot exceed 50 characters')
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Role code must only contain letters, numbers, hyphens, and underscores'
      )
      .transform((val) => val.toUpperCase())
      .optional()
      .or(z.literal('')),
    description: z.string().trim().max(1000).nullable().optional(),
    is_system_role: z.coerce.boolean().default(false),
    is_active: z.coerce.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // chk_roles_system_scope:
    // is_system_role = true  => company_id IS NULL
    // is_system_role = false => company_id IS NOT NULL
    if (data.is_system_role === true && data.company_id != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'System roles are global and cannot have a company_id',
        path: ['company_id'],
      });
    }
    if (data.is_system_role === false && (data.company_id == null || data.company_id <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Company ID is required for company-specific custom roles',
        path: ['company_id'],
      });
    }
  });

export const updateRoleSchema = z.object({
  role_name: z
    .string()
    .trim()
    .min(2, 'Role name must be at least 2 characters')
    .max(100, 'Role name cannot exceed 100 characters')
    .optional(),
  role_code: z
    .string()
    .trim()
    .min(2, 'Role code must be at least 2 characters')
    .max(50, 'Role code cannot exceed 50 characters')
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Role code must only contain letters, numbers, hyphens, and underscores'
    )
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  is_active: z.coerce.boolean().optional(),
});

export const updateRoleStatusSchema = z.object({
  is_active: z.coerce.boolean({
    required_error: 'is_active is required',
    invalid_type_error: 'is_active must be a boolean',
  }),
});

export const roleIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Role ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const roleCodeParamSchema = z.object({
  companyId: z.coerce
    .number()
    .int()
    .positive('Company ID must be a positive integer')
    .optional()
    .or(z.literal('global')),
  roleCode: z.string().trim().min(1, 'Role code is required'),
});

export const getRolesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  include_global: z
    .string()
    .optional()
    .transform((val) => val !== 'false' && val !== '0'),
  search: z.string().trim().optional(),
  is_active: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return val === 'true' || val === '1';
    }),
  is_system_role: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return val === 'true' || val === '1';
    }),
  sortBy: z
    .enum([
      'id',
      'company_id',
      'role_code',
      'role_name',
      'is_system_role',
      'is_active',
      'created_at',
    ])
    .default('id'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createRoleSchema,
  updateRoleSchema,
  updateRoleStatusSchema,
  roleIdParamSchema,
  companyIdParamSchema,
  roleCodeParamSchema,
  getRolesQuerySchema,
};
