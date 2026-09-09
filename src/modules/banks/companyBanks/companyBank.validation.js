import { z } from 'zod';

export const bankAccountTypeEnum = z.enum([
  'savings',
  'current',
  'cash_credit',
  'overdraft',
  'other',
]);

export const createCompanyBankSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  bank_id: z.coerce.number().int().positive('Bank ID must be a positive integer'),
  account_name: z
    .string()
    .trim()
    .min(1, 'Account name is required')
    .max(200, 'Account name cannot exceed 200 characters'),
  account_number: z
    .string()
    .trim()
    .min(1, 'Account number is required')
    .max(100, 'Account number cannot exceed 100 characters'),
  account_type: bankAccountTypeEnum.default('current'),
  branch_name: z.string().trim().max(150).nullable().optional(),
  branch_code: z.string().trim().max(50).nullable().optional(),
  ifsc_code: z
    .string()
    .trim()
    .max(20, 'IFSC code cannot exceed 20 characters')
    .transform((val) => (val ? val.toUpperCase() : val))
    .nullable()
    .optional()
    .or(z.literal('')),
  micr_code: z.string().trim().max(20).nullable().optional(),
  swift_code: z
    .string()
    .trim()
    .max(20, 'SWIFT code cannot exceed 20 characters')
    .transform((val) => (val ? val.toUpperCase() : val))
    .nullable()
    .optional()
    .or(z.literal('')),
  opening_balance: z.coerce
    .number()
    .min(0, 'Opening balance must be greater than or equal to 0')
    .default(0),
  current_balance: z.coerce.number().min(0, 'Current balance cannot be negative').optional(),
  is_primary: z.boolean().default(false),
  is_active: z.boolean().default(true),
  notes: z.string().trim().nullable().optional(),
});

export const updateCompanyBankSchema = createCompanyBankSchema.partial();

export const updateStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});

export const bankIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Bank ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const getCompanyBanksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  bank_id: z.coerce.number().int().positive().optional(),
  account_type: bankAccountTypeEnum.optional(),
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
      'company_id',
      'bank_id',
      'account_name',
      'account_number',
      'account_type',
      'branch_name',
      'opening_balance',
      'current_balance',
      'created_at',
      'is_primary',
      'is_active',
    ])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export default {
  bankAccountTypeEnum,
  createCompanyBankSchema,
  updateCompanyBankSchema,
  updateStatusSchema,
  bankIdParamSchema,
  companyIdParamSchema,
  getCompanyBanksQuerySchema,
};
