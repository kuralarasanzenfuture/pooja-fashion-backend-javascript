import { z } from 'zod';

export const userStatusEnum = z.enum(['active', 'inactive', 'blocked', 'locked']);

const FORBIDDEN_UPDATE_FIELDS = [
  'id',
  'company_id',
  'branch_id',
  'employee_id',
  'role_id',
  'status',
  'username',
  'password',
  'password_hash',
  'is_email_verified',
  'is_phone_verified',
  'email_verified_at',
  'phone_verified_at',
  'failed_login_attempts',
  'locked_until',
  'last_login_at',
  'last_login_ip',
  'password_changed_at',
  'must_change_password',
  'token_version',
  'two_factor_enabled',
  'two_factor_enabled_at',
  'created_by',
  'updated_by',
  'created_at',
  'updated_at',
];

const FORBIDDEN_CREATE_FIELDS = [
  'id',
  'password_hash',
  'status',
  'is_email_verified',
  'is_phone_verified',
  'email_verified_at',
  'phone_verified_at',
  'failed_login_attempts',
  'locked_until',
  'last_login_at',
  'last_login_ip',
  'password_changed_at',
  'must_change_password',
  'token_version',
  'two_factor_enabled',
  'two_factor_enabled_at',
  'created_by',
  'updated_by',
  'created_at',
  'updated_at',
];

/**
 * Schema for creating a new user (POST /api/users)
 */
export const createUserSchema = z
  .object({
    company_id: z.coerce
      .number()
      .int()
      .positive('Company ID must be a positive integer')
      .nullable()
      .optional(),
    branch_id: z.coerce
      .number()
      .int()
      .positive('Branch ID must be a positive integer')
      .nullable()
      .optional(),
    employee_id: z.coerce
      .number()
      .int()
      .positive('Employee ID must be a positive integer')
      .nullable()
      .optional(),
    role_id: z.coerce
      .number()
      .int()
      .positive('Role ID must be a positive integer')
      .nullable()
      .optional(),
    username: z
      .string({ required_error: 'Username is required' })
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
      .max(150, 'Email cannot exceed 150 characters')
      .nullable()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val?.toLowerCase() || null)),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone cannot exceed 20 characters')
      .nullable()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val || null)),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(
        /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'Password must contain at least one number or special character'
      ),
    profile_image_url: z.string().trim().url('Profile image URL must be a valid URL').nullable().optional(),
    profile_image_key: z.string().trim().max(500).nullable().optional(),
    profile_image_name: z.string().trim().max(255).nullable().optional(),
    profile_image_mime_type: z.string().trim().max(100).nullable().optional(),
    profile_image_size: z.coerce.number().int().nonnegative().nullable().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    // Explicitly reject forbidden system-controlled fields in create body
    for (const field of FORBIDDEN_CREATE_FIELDS) {
      if (data[field] !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} is a system-controlled field and cannot be set directly`,
          path: [field],
        });
      }
    }
  });

/**
 * Schema for Admin updating a user (PATCH /api/users/:id)
 * Strictly disallows modifying company_id, branch_id, employee_id, role_id, status, etc.
 */
export const updateUserSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .max(150, 'Email cannot exceed 150 characters')
      .nullable()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val?.toLowerCase() || null)),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone cannot exceed 20 characters')
      .nullable()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val || null)),
    profile_image_url: z.string().trim().url('Profile image URL must be a valid URL').nullable().optional(),
    profile_image_key: z.string().trim().max(500).nullable().optional(),
    profile_image_name: z.string().trim().max(255).nullable().optional(),
    profile_image_mime_type: z.string().trim().max(100).nullable().optional(),
    profile_image_size: z.coerce.number().int().nonnegative().nullable().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    // Return specific informative error messages for immutable / security fields
    if (data.company_id !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'company_id cannot be modified after user creation',
        path: ['company_id'],
      });
    }
    if (data.branch_id !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'branch_id cannot be modified after user creation',
        path: ['branch_id'],
      });
    }
    if (data.employee_id !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'employee_id cannot be modified after user creation',
        path: ['employee_id'],
      });
    }
    if (data.role_id !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'role_id cannot be modified through generic user update',
        path: ['role_id'],
      });
    }
    if (data.status !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'status cannot be modified through generic update; use dedicated status endpoints',
        path: ['status'],
      });
    }
    if (data.username !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'username cannot be modified through generic update',
        path: ['username'],
      });
    }
    if (data.password !== undefined || data.password_hash !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'password cannot be modified through generic update; use dedicated password endpoints',
        path: ['password'],
      });
    }

    for (const field of FORBIDDEN_UPDATE_FIELDS) {
      if (
        !['company_id', 'branch_id', 'employee_id', 'role_id', 'status', 'username', 'password', 'password_hash'].includes(field) &&
        data[field] !== undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} is a protected field and cannot be updated`,
          path: [field],
        });
      }
    }
  });

/**
 * Schema for User updating their own profile (PATCH /api/users/me)
 */
export const updateMyProfileSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .max(150, 'Email cannot exceed 150 characters')
      .nullable()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val?.toLowerCase() || null)),
    phone: z
      .string()
      .trim()
      .max(20, 'Phone cannot exceed 20 characters')
      .nullable()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val || null)),
    profile_image_url: z.string().trim().url('Profile image URL must be a valid URL').nullable().optional(),
    profile_image_key: z.string().trim().max(500).nullable().optional(),
    profile_image_name: z.string().trim().max(255).nullable().optional(),
    profile_image_mime_type: z.string().trim().max(100).nullable().optional(),
    profile_image_size: z.coerce.number().int().nonnegative().nullable().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    for (const field of FORBIDDEN_UPDATE_FIELDS) {
      if (data[field] !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} cannot be modified through profile update`,
          path: [field],
        });
      }
    }
  });

/**
 * Schema for changing password (PATCH /api/users/me/password)
 */
export const changePasswordSchema = z.object({
  current_password: z.string({ required_error: 'Current password is required' }).min(1, 'Current password cannot be empty'),
  new_password: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters long')
    .max(100, 'New password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(
      /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      'New password must contain at least one number or special character'
    ),
});

/**
 * Schema for updating user status via dedicated status endpoint
 */
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
      'phone',
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
  updateMyProfileSchema,
  changePasswordSchema,
  updateUserStatusSchema,
  userIdParamSchema,
  getUsersQuerySchema,
};
