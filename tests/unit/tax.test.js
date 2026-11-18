import { describe, it, expect } from '@jest/globals';
import { toTaxDTO, toTaxesDTO } from '../../src/modules/product-master/taxes/tax.mapper.js';
import {
  createTaxSchema,
  updateTaxSchema,
  updateTaxStatusSchema,
  calculateTaxSchema,
  taxIdParamSchema,
  companyIdParamSchema,
  taxCodeParamSchema,
  getTaxesQuerySchema,
  getAllTaxesQuerySchema,
  getTaxStatsQuerySchema,
  checkTaxNameQuerySchema,
  checkTaxCodeQuerySchema,
  seedDefaultTaxesSchema,
} from '../../src/modules/product-master/taxes/tax.validation.js';
import {
  calculateTaxBreakdown,
  DEFAULT_TAXES,
  generateTaxCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from '../../src/modules/product-master/taxes/tax.service.js';
import {
  TAX_TYPES,
  TAX_SORT_FIELDS,
  STANDARD_GST_SLABS,
} from '../../src/modules/product-master/taxes/tax.types.js';
import ForbiddenError from '../../src/shared/errors/ForbiddenError.js';

describe('Product Master: Taxes Unit Tests', () => {
  describe('Tax Mapper', () => {
    const mockDbTaxRow = {
      id: 5,
      company_id: 1,
      company_name: 'Pooja Fashion Pvt Ltd',
      company_code: 'PF-001',
      tax_code: 'GST_18',
      tax_name: 'GST 18%',
      tax_type: 'GST',
      rate: '18.0000',
      cgst_rate: '9.0000',
      sgst_rate: '9.0000',
      igst_rate: '18.0000',
      cess_rate: '0.0000',
      is_inclusive: false,
      is_active: true,
      created_by: 2,
      created_by_name: 'Admin User',
      updated_by: 2,
      updated_by_name: 'Admin User',
      created_at: '2026-09-01T00:00:00.000Z',
      updated_at: '2026-09-01T00:00:00.000Z',
    };

    it('should map database entity to client TaxDTO format with parsed rates', () => {
      const dto = toTaxDTO(mockDbTaxRow);

      expect(dto).toBeDefined();
      expect(dto.id).toBe('5');
      expect(dto.company_id).toBe('1');
      expect(dto.tax_code).toBe('GST_18');
      expect(dto.tax_name).toBe('GST 18%');
      expect(dto.rate).toBe(18.0);
      expect(dto.cgst_rate).toBe(9.0);
      expect(dto.sgst_rate).toBe(9.0);
      expect(dto.igst_rate).toBe(18.0);
      expect(dto.cess_rate).toBe(0);
      expect(dto.is_inclusive).toBe(false);
      expect(dto.is_active).toBe(true);
    });

    it('should return null when input row is null or undefined', () => {
      expect(toTaxDTO(null)).toBeNull();
      expect(toTaxDTO(undefined)).toBeNull();
    });

    it('should map array of tax rows correctly', () => {
      const dtos = toTaxesDTO([mockDbTaxRow]);
      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('5');
    });

    it('should return empty array for non-array input', () => {
      expect(toTaxesDTO(null)).toEqual([]);
      expect(toTaxesDTO(undefined)).toEqual([]);
    });
  });

  describe('Validation Schemas', () => {
    describe('createTaxSchema', () => {
      it('should validate valid tax creation payload', () => {
        const payload = {
          company_id: '1',
          tax_code: 'gst_12',
          tax_name: 'GST 12%',
          rate: 12,
          cgst_rate: 6,
          sgst_rate: 6,
          igst_rate: 12,
          is_inclusive: false,
        };

        const result = createTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.tax_code).toBe('GST_12');
        expect(result.data.tax_type).toBe('GST');
        expect(result.data.is_active).toBe(true);
        expect(result.data.cess_rate).toBe(0);
      });

      it('should reject missing required fields', () => {
        const payload = {
          tax_name: 'GST 18%',
          rate: 18,
        };

        const result = createTaxSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it('should reject negative rates or rates > 100', () => {
        expect(
          createTaxSchema.safeParse({
            company_id: '1',
            tax_code: 'GST_NEG',
            tax_name: 'Negative',
            rate: -5,
          }).success
        ).toBe(false);

        expect(
          createTaxSchema.safeParse({
            company_id: '1',
            tax_code: 'GST_HIGH',
            tax_name: 'Too High',
            rate: 105,
          }).success
        ).toBe(false);
      });

      it('should reject when sum of CGST + SGST exceeds total rate', () => {
        const payload = {
          company_id: '1',
          tax_code: 'GST_INV',
          tax_name: 'Invalid Components',
          rate: 10,
          cgst_rate: 6,
          sgst_rate: 6, // 6 + 6 = 12 > 10
        };

        const result = createTaxSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });
    });

    describe('updateTaxSchema', () => {
      it('should validate partial update payload', () => {
        const payload = {
          tax_name: 'Updated Name',
          is_active: false,
        };

        const result = updateTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.tax_name).toBe('Updated Name');
        expect(result.data.is_active).toBe(false);
      });
    });

    describe('updateTaxStatusSchema', () => {
      it('should validate active status boolean', () => {
        expect(updateTaxStatusSchema.safeParse({ is_active: true }).success).toBe(true);
        expect(updateTaxStatusSchema.safeParse({ is_active: false }).success).toBe(true);
        expect(updateTaxStatusSchema.safeParse({}).success).toBe(false);
      });
    });

    describe('calculateTaxSchema', () => {
      it('should validate calculation payload with rate', () => {
        const payload = {
          amount: 500,
          rate: 18,
          is_inter_state: true,
        };

        const result = calculateTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.amount).toBe(500);
      });

      it('should validate calculation payload with tax_id', () => {
        const payload = {
          amount: 1000,
          tax_id: '5',
        };

        const result = calculateTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.tax_id).toBe('5');
      });

      it('should reject calculation if both tax_id and rate are omitted', () => {
        const payload = { amount: 1000 };
        const result = calculateTaxSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it('should reject non-positive amounts', () => {
        expect(calculateTaxSchema.safeParse({ amount: 0, rate: 18 }).success).toBe(false);
        expect(calculateTaxSchema.safeParse({ amount: -100, rate: 18 }).success).toBe(false);
      });
    });

    describe('Query and Param Schemas', () => {
      it('should validate getTaxesQuerySchema defaults and filters', () => {
        const result = getTaxesQuerySchema.safeParse({
          page: '1',
          limit: '10',
          tax_type: 'gst',
          is_active: 'true',
        });

        expect(result.success).toBe(true);
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.tax_type).toBe('GST');
        expect(result.data.is_active).toBe(true);
        expect(result.data.sort_by).toBe(TAX_SORT_FIELDS.RATE);
      });

      it('should validate getAllTaxesQuerySchema for unpaginated dropdowns', () => {
        const result = getAllTaxesQuerySchema.safeParse({
          company_id: '1',
          is_active: 'true',
          search: 'GST',
        });
        expect(result.success).toBe(true);
        expect(result.data.company_id).toBe('1');
        expect(result.data.is_active).toBe(true);
        expect(result.data.search).toBe('GST');
      });

      it('should validate getTaxStatsQuerySchema', () => {
        const result = getTaxStatsQuerySchema.safeParse({ company_id: '2' });
        expect(result.success).toBe(true);
        expect(result.data.company_id).toBe('2');
      });

      it('should validate taxIdParamSchema and companyIdParamSchema', () => {
        expect(taxIdParamSchema.safeParse({ id: '10' }).success).toBe(true);
        expect(companyIdParamSchema.safeParse({ companyId: '1' }).success).toBe(true);
        expect(taxCodeParamSchema.safeParse({ companyId: '1', taxCode: 'GST_18' }).success).toBe(true);
      });

      it('should validate checkTaxNameQuerySchema and checkTaxCodeQuerySchema', () => {
        const nameRes = checkTaxNameQuerySchema.safeParse({ tax_name: 'GST 18%', company_id: '1' });
        expect(nameRes.success).toBe(true);
        const codeRes = checkTaxCodeQuerySchema.safeParse({ tax_code: 'GST_18', company_id: '1' });
        expect(codeRes.success).toBe(true);
      });

      it('should validate seedDefaultTaxesSchema', () => {
        expect(seedDefaultTaxesSchema.safeParse({ company_id: '1' }).success).toBe(true);
        expect(seedDefaultTaxesSchema.safeParse({}).success).toBe(true);
      });
    });
  });

  describe('Tax Utilities & Tenant Isolation', () => {
    describe('generateTaxCode', () => {
      it('should generate uppercase snake_case tax code from name', () => {
        expect(generateTaxCode('GST 18%')).toBe('GST_18');
        expect(generateTaxCode('Luxury Cess 15%')).toBe('LUXURY_CESS_15');
        expect(generateTaxCode('VAT 5.5%')).toBe('VAT_5_5');
      });

      it('should fallback to rate if name is empty', () => {
        expect(generateTaxCode('', 18)).toBe('GST_18');
        expect(generateTaxCode(null, 5)).toBe('GST_5');
      });

      it('should return empty string if both name and rate are omitted', () => {
        expect(generateTaxCode(null, null)).toBe('');
        expect(generateTaxCode('', undefined)).toBe('');
      });
    });

    describe('canUserSelectCompany', () => {
      it('returns true for SUPERADMIN', () => {
        expect(canUserSelectCompany({ role: 'SUPERADMIN' })).toBe(true);
        expect(canUserSelectCompany({ roleCode: 'superadmin' })).toBe(true);
      });

      it('returns true for platform ADMIN without companyId', () => {
        expect(canUserSelectCompany({ role: 'ADMIN' })).toBe(true);
        expect(canUserSelectCompany({ role: 'ADMIN', companyId: null })).toBe(true);
      });

      it('returns false for tenant users bound to a company', () => {
        expect(canUserSelectCompany({ role: 'ADMIN', companyId: 1 })).toBe(false);
        expect(canUserSelectCompany({ role: 'STAFF', company_id: 2 })).toBe(false);
        expect(canUserSelectCompany(null)).toBe(false);
      });
    });

    describe('resolveEffectiveCompanyId', () => {
      it('returns user companyId for tenant users', () => {
        const tenantUser = { id: 10, role: 'STAFF', companyId: 2 };
        expect(resolveEffectiveCompanyId(tenantUser, null)).toBe(2);
        expect(resolveEffectiveCompanyId(tenantUser, 2)).toBe(2);
      });

      it('throws ForbiddenError if tenant user tries to access another company', () => {
        const tenantUser = { id: 10, role: 'STAFF', companyId: 2 };
        expect(() => resolveEffectiveCompanyId(tenantUser, 5)).toThrow(ForbiddenError);
      });

      it('allows superadmin to choose any company', () => {
        const superadmin = { id: 1, role: 'SUPERADMIN' };
        expect(resolveEffectiveCompanyId(superadmin, 5)).toBe(5);
        expect(resolveEffectiveCompanyId(superadmin, null)).toBeNull();
      });
    });
  });

  describe('Tax Calculation Engine', () => {
    it('should accurately calculate exclusive intra-state GST (CGST + SGST split)', async () => {
      const calc = await calculateTaxBreakdown({
        amount: 1000,
        rate: 18,
        is_inter_state: false,
        is_inclusive: false,
      });

      expect(calc.taxable_amount).toBe(1000);
      expect(calc.tax_rate).toBe(18);
      expect(calc.tax_amount).toBe(180);
      expect(calc.cgst_rate).toBe(9);
      expect(calc.cgst_amount).toBe(90);
      expect(calc.sgst_rate).toBe(9);
      expect(calc.sgst_amount).toBe(90);
      expect(calc.igst_rate).toBe(0);
      expect(calc.igst_amount).toBe(0);
      expect(calc.total_amount).toBe(1180);
      expect(calc.is_inclusive).toBe(false);
    });

    it('should accurately calculate exclusive inter-state GST (full IGST)', async () => {
      const calc = await calculateTaxBreakdown({
        amount: 1000,
        rate: 18,
        is_inter_state: true,
        is_inclusive: false,
      });

      expect(calc.taxable_amount).toBe(1000);
      expect(calc.tax_amount).toBe(180);
      expect(calc.cgst_amount).toBe(0);
      expect(calc.sgst_amount).toBe(0);
      expect(calc.igst_rate).toBe(18);
      expect(calc.igst_amount).toBe(180);
      expect(calc.total_amount).toBe(1180);
    });

    it('should accurately calculate tax-inclusive price breakdown', async () => {
      // Selling price 1180 inclusive of 18% GST -> Base should be 1000, tax 180
      const calc = await calculateTaxBreakdown({
        amount: 1180,
        rate: 18,
        is_inter_state: false,
        is_inclusive: true,
      });

      expect(calc.taxable_amount).toBe(1000);
      expect(calc.tax_amount).toBe(180);
      expect(calc.cgst_amount).toBe(90);
      expect(calc.sgst_amount).toBe(90);
      expect(calc.total_amount).toBe(1180);
      expect(calc.is_inclusive).toBe(true);
    });

    it('should verify standard GST slabs definition contains 5 essential slabs', () => {
      expect(STANDARD_GST_SLABS).toHaveLength(5);
      const codes = STANDARD_GST_SLABS.map((s) => s.tax_code);
      expect(codes).toEqual(['GST_0', 'GST_5', 'GST_12', 'GST_18', 'GST_28']);
    });

    it('should verify DEFAULT_TAXES matches standard GST slabs and user specification', () => {
      expect(DEFAULT_TAXES).toHaveLength(5);
      expect(DEFAULT_TAXES[0]).toEqual(expect.objectContaining({ tax_code: 'GST_0', rate: 0, cgst_rate: 0, sgst_rate: 0, igst_rate: 0 }));
      expect(DEFAULT_TAXES[1]).toEqual(expect.objectContaining({ tax_code: 'GST_5', rate: 5, cgst_rate: 2.5, sgst_rate: 2.5, igst_rate: 5 }));
      expect(DEFAULT_TAXES[2]).toEqual(expect.objectContaining({ tax_code: 'GST_12', rate: 12, cgst_rate: 6, sgst_rate: 6, igst_rate: 12 }));
      expect(DEFAULT_TAXES[3]).toEqual(expect.objectContaining({ tax_code: 'GST_18', rate: 18, cgst_rate: 9, sgst_rate: 9, igst_rate: 18 }));
      expect(DEFAULT_TAXES[4]).toEqual(expect.objectContaining({ tax_code: 'GST_28', rate: 28, cgst_rate: 14, sgst_rate: 14, igst_rate: 28 }));
    });
  });
});
