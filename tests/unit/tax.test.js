import { describe, it, expect } from '@jest/globals';
import { toTaxDTO, toTaxesDTO } from '../../src/modules/product-master/taxes/tax.mapper.js';
import {
  createTaxSchema,
  updateTaxSchema,
  calculateTaxSchema,
  taxIdParamSchema,
  getTaxesQuerySchema,
} from '../../src/modules/product-master/taxes/tax.validation.js';
import { calculateTaxBreakdown } from '../../src/modules/product-master/taxes/tax.service.js';
import {
  TAX_TYPES,
  TAX_SORT_FIELDS,
  STANDARD_GST_SLABS,
} from '../../src/modules/product-master/taxes/tax.types.js';

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
          tax_code: 'GST_ERR',
          tax_name: 'Error Slab',
          rate: 10,
          cgst_rate: 6,
          sgst_rate: 6, // 6 + 6 = 12 > 10
        };

        const result = createTaxSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Sum of CGST and SGST cannot exceed total tax rate');
      });
    });

    describe('updateTaxSchema', () => {
      it('should validate partial update payload', () => {
        const payload = {
          tax_name: 'GST Standard 18%',
          rate: 18,
          cgst_rate: 9,
          sgst_rate: 9,
        };

        const result = updateTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
      });
    });

    describe('calculateTaxSchema', () => {
      it('should validate calculation payload with rate', () => {
        const payload = {
          amount: 1000,
          rate: 18,
          is_inter_state: true,
        };

        const result = calculateTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.is_inter_state).toBe(true);
      });

      it('should validate calculation payload with tax_id', () => {
        const payload = {
          amount: 500,
          tax_id: '5',
        };

        const result = calculateTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.is_inter_state).toBe(false);
      });

      it('should reject calculation if both tax_id and rate are omitted', () => {
        const payload = {
          amount: 1000,
        };

        const result = calculateTaxSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Either tax_id or rate must be provided');
      });

      it('should reject non-positive amounts', () => {
        expect(
          calculateTaxSchema.safeParse({ amount: 0, rate: 18 }).success
        ).toBe(false);
        expect(
          calculateTaxSchema.safeParse({ amount: -100, rate: 18 }).success
        ).toBe(false);
      });
    });

    describe('getTaxesQuerySchema', () => {
      it('should validate query defaults and filters', () => {
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
  });
});
