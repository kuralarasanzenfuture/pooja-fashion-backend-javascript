import { z } from 'zod';
import { DISCOUNT_SORT_FIELDS, DISCOUNT_TYPES } from './discount.types.js';

const idSchema = z
  .union([z.string().regex(/^\d+$/, 'Must be a numeric string'), z.number().int().positive()])
  .transform((val) => String(val));

const optionalNumberSchema = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  });

const datetimeSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;
    return val;
  })
  .refine(
    (val) => {
      if (!val) return true;
      return !isNaN(Date.parse(val));
    },
    { message: 'Invalid datetime format' }
  );

export const discountIdParamSchema = z.object({
  id: idSchema,
});

export const companyIdParamSchema = z.object({
  companyId: idSchema,
});

export const createDiscountSchema = z
  .object({
    company_id: idSchema,
    discount_code: z
      .string()
      .trim()
      .min(1, 'Discount code is required')
      .max(50, 'Discount code must not exceed 50 characters')
      .toUpperCase(),
    discount_name: z
      .string()
      .trim()
      .min(1, 'Discount name is required')
      .max(150, 'Discount name must not exceed 150 characters'),
    discount_type: z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.FIXED_AMOUNT]),
    discount_value: z.coerce.number().min(0, 'Discount value must be greater than or equal to 0'),
    minimum_quantity: optionalNumberSchema
      .refine((val) => val === undefined || val === null || val > 0, {
        message: 'Minimum quantity must be greater than 0',
      })
      .default(null),
    maximum_discount: optionalNumberSchema
      .refine((val) => val === undefined || val === null || val >= 0, {
        message: 'Maximum discount must be greater than or equal to 0',
      })
      .default(null),
    start_at: datetimeSchema.default(null),
    end_at: datetimeSchema.default(null),
    priority: z.coerce.number().int().default(0),
    is_stackable: z.boolean().optional().default(false),
    is_active: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.discount_type === DISCOUNT_TYPES.PERCENTAGE && data.discount_value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_value'],
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    if (data.start_at && data.end_at) {
      const startTime = new Date(data.start_at).getTime();
      const endTime = new Date(data.end_at).getTime();
      if (endTime <= startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['end_at'],
          message: 'end_at must be after start_at',
        });
      }
    }
  });

export const updateDiscountSchema = z
  .object({
    discount_code: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .toUpperCase()
      .optional(),
    discount_name: z
      .string()
      .trim()
      .min(1)
      .max(150)
      .optional(),
    discount_type: z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.FIXED_AMOUNT]).optional(),
    discount_value: z.coerce.number().min(0).optional(),
    minimum_quantity: optionalNumberSchema.refine(
      (val) => val === undefined || val === null || val > 0,
      {
        message: 'Minimum quantity must be greater than 0',
      }
    ),
    maximum_discount: optionalNumberSchema.refine(
      (val) => val === undefined || val === null || val >= 0,
      {
        message: 'Maximum discount must be greater than or equal to 0',
      }
    ),
    start_at: datetimeSchema,
    end_at: datetimeSchema,
    priority: z.coerce.number().int().optional(),
    is_stackable: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discount_type === DISCOUNT_TYPES.PERCENTAGE && data.discount_value !== undefined && data.discount_value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_value'],
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    if (data.start_at && data.end_at) {
      const startTime = new Date(data.start_at).getTime();
      const endTime = new Date(data.end_at).getTime();
      if (endTime <= startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['end_at'],
          message: 'end_at must be after start_at',
        });
      }
    }
  });

export const updateDiscountStatusSchema = z.object({
  is_active: z.boolean(),
});

export const calculateDiscountSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    quantity: z.coerce.number().positive().default(1),
    discount_id: idSchema.optional(),
    discount_type: z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.FIXED_AMOUNT]).optional(),
    discount_value: z.coerce.number().min(0).optional(),
    maximum_discount: optionalNumberSchema.refine(
      (val) => val === undefined || val === null || val >= 0,
      {
        message: 'Maximum discount must be greater than or equal to 0',
      }
    ),
    minimum_quantity: optionalNumberSchema.refine(
      (val) => val === undefined || val === null || val > 0,
      {
        message: 'Minimum quantity must be greater than 0',
      }
    ),
    as_of: datetimeSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.discount_id && (!data.discount_type || data.discount_value === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_id'],
        message: 'Either discount_id or both discount_type and discount_value must be provided',
      });
    }

    if (
      data.discount_type === DISCOUNT_TYPES.PERCENTAGE &&
      data.discount_value !== undefined &&
      data.discount_value > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discount_value'],
        message: 'Percentage discount cannot exceed 100%',
      });
    }
  });

export const getDiscountsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z
    .enum(Object.values(DISCOUNT_SORT_FIELDS))
    .default(DISCOUNT_SORT_FIELDS.PRIORITY),
  sort_order: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  search: z.string().trim().optional(),
  company_id: idSchema.optional(),
  discount_type: z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.FIXED_AMOUNT]).optional(),
  is_active: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  is_stackable: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  as_of: datetimeSchema,
});
