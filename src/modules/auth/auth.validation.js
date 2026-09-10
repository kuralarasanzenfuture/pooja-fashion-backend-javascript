import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Username, email, or phone is required'),
  password: z.string().min(1, 'Password is required'),
  company_id: z.coerce.number().int().positive().optional(),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().trim().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
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

export const sessionIdParamSchema = z.object({
  id: z.string().uuid('Invalid session ID format. Must be a valid UUID'),
});

export const loginHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['success', 'failed', 'blocked', 'locked', 'logout']).optional(),
});

export default {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  sessionIdParamSchema,
  loginHistoryQuerySchema,
};
