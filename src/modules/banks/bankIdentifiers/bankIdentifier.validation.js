import { z } from 'zod';

export const identifierTypeEnum = z.enum([
  'ifsc',
  'micr',
  'swift',
  'bank_code',
  'routing_number',
  'other',
]);

export const createBankIdentifierSchema = z.object({
  bank_id: z.coerce.number().int().positive('Bank ID must be a positive integer'),
  identifier_type: identifierTypeEnum,
  identifier_value: z
    .string()
    .trim()
    .min(1, 'Identifier value is required')
    .max(100, 'Identifier value cannot exceed 100 characters')
    .transform((val) => val.toUpperCase()),
  branch_name: z.string().trim().max(150).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  is_active: z.boolean().default(true),
});

export const updateBankIdentifierSchema = createBankIdentifierSchema.partial();

export const updateStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});

export const identifierIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Identifier ID must be a positive integer'),
});

export const bankIdParamSchema = z.object({
  bankId: z.coerce.number().int().positive('Bank ID must be a positive integer'),
});

export const identifierValueParamSchema = z.object({
  identifierValue: z.string().trim().min(1, 'Identifier value is required'),
});

export const getBankIdentifiersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  bank_id: z.coerce.number().int().positive().optional(),
  identifier_type: identifierTypeEnum.optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
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
      'bank_id',
      'identifier_type',
      'identifier_value',
      'branch_name',
      'city',
      'state',
      'created_at',
      'is_active',
    ])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export default {
  identifierTypeEnum,
  createBankIdentifierSchema,
  updateBankIdentifierSchema,
  updateStatusSchema,
  identifierIdParamSchema,
  bankIdParamSchema,
  identifierValueParamSchema,
  getBankIdentifiersQuerySchema,
};
