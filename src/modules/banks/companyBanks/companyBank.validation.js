import { z } from 'zod';

export const bankAccountTypeEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase().replace(/[-\s]+/g, '_') : val),
  z.enum(['savings', 'current', 'cash_credit', 'overdraft', 'other'], {
    errorMap: () => ({
      message: 'Invalid account type. Allowed: savings, current, cash_credit, overdraft, other',
    }),
  })
);

const optionalTrimmedString = (maxLen) =>
  z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    if (typeof val === 'string') {
      const t = val.trim();
      return t.length > 0 ? t : null;
    }
    return val;
  }, z.string().max(maxLen).nullable().optional());

const optionalUpperCaseString = (maxLen) =>
  z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    if (typeof val === 'string') {
      const t = val.trim().toUpperCase();
      return t.length > 0 ? t : null;
    }
    return val;
  }, z.string().max(maxLen).nullable().optional());

const booleanCoerce = (defaultValue) =>
  z.preprocess((val) => {
    if (val === undefined) return defaultValue;
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1' || val === 1) return true;
    if (val === 'false' || val === '0' || val === 0) return false;
    return val;
  }, defaultValue !== undefined ? z.boolean().default(defaultValue) : z.boolean().optional());

const normalizeCompanyBankPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };

  if (n.companyId !== undefined && n.company_id === undefined) n.company_id = n.companyId;
  if (n.bankId !== undefined && n.bank_id === undefined) n.bank_id = n.bankId;
  if (n.accountName !== undefined && n.account_name === undefined) n.account_name = n.accountName;
  if (n.accountNumber !== undefined && n.account_number === undefined) n.account_number = n.accountNumber;
  if (n.accountType !== undefined && n.account_type === undefined) n.account_type = n.accountType;
  if (n.branchName !== undefined && n.branch_name === undefined) n.branch_name = n.branchName;
  if (n.branchCode !== undefined && n.branch_code === undefined) n.branch_code = n.branchCode;
  if (n.ifscCode !== undefined && n.ifsc_code === undefined) n.ifsc_code = n.ifscCode;
  if (n.micrCode !== undefined && n.micr_code === undefined) n.micr_code = n.micrCode;
  if (n.swiftCode !== undefined && n.swift_code === undefined) n.swift_code = n.swiftCode;
  if (n.openingBalance !== undefined && n.opening_balance === undefined) n.opening_balance = n.openingBalance;
  if (n.currentBalance !== undefined && n.current_balance === undefined) n.current_balance = n.currentBalance;
  if (n.isPrimary !== undefined && n.is_primary === undefined) n.is_primary = n.isPrimary;
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;

  return n;
};

const baseCreateCompanyBankSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  bank_id: z.coerce.number().int().positive('Bank ID must be a positive integer'),
  account_name: z
    .string({ required_error: 'Account name is required' })
    .trim()
    .min(1, 'Account name is required')
    .max(200, 'Account name cannot exceed 200 characters'),
  account_number: z
    .string({ required_error: 'Account number is required' })
    .trim()
    .min(1, 'Account number is required')
    .max(100, 'Account number cannot exceed 100 characters'),
  account_type: bankAccountTypeEnum.default('current'),
  branch_name: optionalTrimmedString(150),
  branch_code: optionalTrimmedString(50),
  ifsc_code: optionalUpperCaseString(20),
  micr_code: optionalTrimmedString(20),
  swift_code: optionalUpperCaseString(20),
  opening_balance: z.coerce
    .number()
    .min(0, 'Opening balance must be greater than or equal to 0')
    .default(0),
  current_balance: z.coerce.number().min(0, 'Current balance cannot be negative').optional(),
  is_primary: booleanCoerce(false),
  is_active: booleanCoerce(true),
  notes: optionalTrimmedString(2000),
});

export const createCompanyBankSchema = z.preprocess(
  normalizeCompanyBankPayload,
  baseCreateCompanyBankSchema
);

export const updateCompanyBankSchema = z.preprocess(
  normalizeCompanyBankPayload,
  baseCreateCompanyBankSchema.partial()
);

const normalizeStatusPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;
  if (n.status !== undefined && n.is_active === undefined) {
    if (typeof n.status === 'string') {
      n.is_active = n.status.toLowerCase() === 'active';
    } else {
      n.is_active = Boolean(n.status);
    }
  }
  return n;
};

export const updateStatusSchema = z.preprocess(
  normalizeStatusPayload,
  z.object({
    is_active: z.preprocess((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true' || val === '1' || val === 1) return true;
      if (val === 'false' || val === '0' || val === 0) return false;
      return val;
    }, z.boolean({ required_error: 'is_active is required' })),
  })
);

export const bankIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Bank ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

const normalizeQueryPayload = (query) => {
  if (!query || typeof query !== 'object') return query;
  const n = { ...query };
  if (n.companyId !== undefined && n.company_id === undefined) n.company_id = n.companyId;
  if (n.bankId !== undefined && n.bank_id === undefined) n.bank_id = n.bankId;
  if (n.accountType !== undefined && n.account_type === undefined) n.account_type = n.accountType;
  if (n.isPrimary !== undefined && n.is_primary === undefined) n.is_primary = n.isPrimary;
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;

  ['company_id', 'bank_id', 'account_type', 'is_primary', 'is_active', 'search'].forEach(
    (key) => {
      if (n[key] === '') delete n[key];
    }
  );
  return n;
};

export const getCompanyBanksQuerySchema = z.preprocess(
  normalizeQueryPayload,
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    company_id: z.coerce.number().int().positive().optional(),
    bank_id: z.coerce.number().int().positive().optional(),
    account_type: bankAccountTypeEnum.optional(),
    is_primary: z
      .preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (val === 'true' || val === '1' || val === 1) return true;
        if (val === 'false' || val === '0' || val === 0) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    is_active: z
      .preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (val === 'true' || val === '1' || val === 1) return true;
        if (val === 'false' || val === '0' || val === 0) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    search: z.string().trim().optional(),
    sortBy: z
      .enum([
        'id',
        'company_id',
        'companyId',
        'bank_id',
        'bankId',
        'account_name',
        'accountName',
        'account_number',
        'accountNumber',
        'account_type',
        'accountType',
        'branch_name',
        'branchName',
        'opening_balance',
        'openingBalance',
        'current_balance',
        'currentBalance',
        'created_at',
        'createdAt',
        'is_primary',
        'isPrimary',
        'is_active',
        'isActive',
      ])
      .default('created_at'),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  })
);

export default {
  bankAccountTypeEnum,
  createCompanyBankSchema,
  updateCompanyBankSchema,
  updateStatusSchema,
  bankIdParamSchema,
  companyIdParamSchema,
  getCompanyBanksQuerySchema,
};
