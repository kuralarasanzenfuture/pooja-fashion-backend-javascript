import { z } from 'zod';

export const userStatusEnum = z.enum(['active', 'inactive', 'blocked', 'locked']);

export const createUserSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  branch_id: z.coerce.number().int().positive().nullable().optional(),
  role_id: z.coerce.number().int().positive().nullable().optional(),
  employee_id: z.coerce.number().int().positive().nullable().optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'Username can only contain letters, numbers, dots, hyphens, and underscores'
    ),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150)
    .nullable()
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().max(20).nullable().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(
      /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      'Password must contain at least one number or special character'
    ),
  profile_image_url: z.string().trim().url().nullable().optional(),
  status: userStatusEnum.default('active'),
  is_email_verified: z.coerce.boolean().default(false),
  is_phone_verified: z.coerce.boolean().default(false),
  two_factor_enabled: z.coerce.boolean().default(false),
});

export const updateUserSchema = z.object({
  branch_id: z.coerce.number().int().positive().nullable().optional(),
  role_id: z.coerce.number().int().positive().nullable().optional(),
  employee_id: z.coerce.number().int().positive().nullable().optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'Username can only contain letters, numbers, dots, hyphens, and underscores'
    )
    .optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150)
    .nullable()
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().max(20).nullable().optional(),
  profile_image_url: z.string().trim().url().nullable().optional(),
  is_email_verified: z.coerce.boolean().optional(),
  is_phone_verified: z.coerce.boolean().optional(),
  two_factor_enabled: z.coerce.boolean().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().optional(),
  new_password: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .max(100, 'New password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(
      /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      'New password must contain at least one number or special character'
    ),
});

export const updateUserStatusSchema = z.object({
  status: userStatusEnum,
  lock_minutes: z.coerce.number().int().positive().optional(),
});

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive('User ID must be a positive integer'),
});

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  branch_id: z.coerce.number().int().positive().optional(),
  role_id: z.coerce.number().int().positive().optional(),
  status: userStatusEnum.optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      'id',
      'username',
      'email',
      'status',
      'company_id',
      'branch_id',
      'role_id',
      'created_at',
      'last_login_at',
    ])
    .default('id'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  updateUserStatusSchema,
  userIdParamSchema,
  getUsersQuerySchema,
};
