import { describe, it, expect } from '@jest/globals';
import {
  toProductTaxDTO,
  toProductTaxesDTO,
  toResolvedTaxDTO,
} from '../../src/modules/product-master/productTaxes/productTax.mapper.js';
import {
  createProductTaxSchema,
  updateProductTaxSchema,
  updateProductTaxStatusSchema,
  resolveTaxQuerySchema,
  bulkAssignTaxSchema,
  productTaxIdParamSchema,
  getProductTaxesQuerySchema,
} from '../../src/modules/product-master/productTaxes/productTax.validation.js';
import { PRODUCT_TAX_SORT_FIELDS } from '../../src/modules/product-master/productTaxes/productTax.types.js';

describe('Product Master: Product Taxes Unit Tests', () => {
  describe('Product Tax Mapper', () => {
    const mockDbProductTaxRow = {
      id: 15,
      company_id: 1,
      company_name: 'Pooja Fashion Pvt Ltd',
      company_code: 'PF-001',
      product_id: 25,
      product_name: 'Cotton Floral Anarkali',
      product_code: 'CFA-001',
      variant_id: 50,
      variant_sku: 'CFA-BLUE-L',
      variant_name: 'Blue / L',
      tax_id: 3,
      tax_code: 'GST_12',
      tax_name: 'GST 12%',
      tax_type: 'GST',
      rate: '12.0000',
      cgst_rate: '6.0000',
      sgst_rate: '6.0000',
      igst_rate: '12.0000',
      cess_rate: '0.0000',
      is_inclusive: false,
      is_primary: true,
      effective_from: '2026-09-01T00:00:00.000Z',
      effective_to: null,
      is_active: true,
      created_by: 2,
      created_by_name: 'Admin User',
      updated_by: 2,
      updated_by_name: 'Admin User',
      created_at: '2026-09-01T00:00:00.000Z',
      updated_at: '2026-09-01T00:00:00.000Z',
    };

    it('should map database entity to client ProductTaxDTO format with parsed rates', () => {
      const dto = toProductTaxDTO(mockDbProductTaxRow);

      expect(dto).toBeDefined();
      expect(dto.id).toBe('15');
      expect(dto.company_id).toBe('1');
      expect(dto.product_id).toBe('25');
      expect(dto.variant_id).toBe('50');
      expect(dto.tax_id).toBe('3');
      expect(dto.tax_code).toBe('GST_12');
      expect(dto.rate).toBe(12.0);
      expect(dto.cgst_rate).toBe(6.0);
      expect(dto.sgst_rate).toBe(6.0);
      expect(dto.igst_rate).toBe(12.0);
      expect(dto.is_primary).toBe(true);
      expect(dto.is_active).toBe(true);
    });

    it('should handle product-level tax without variant gracefully', () => {
      const productLevelRow = {
        ...mockDbProductTaxRow,
        variant_id: null,
        variant_sku: null,
        variant_name: null,
      };

      const dto = toProductTaxDTO(productLevelRow);
      expect(dto.variant_id).toBeNull();
      expect(dto.variant_sku).toBeNull();
    });

    it('should return null when input row is null or undefined', () => {
      expect(toProductTaxDTO(null)).toBeNull();
      expect(toProductTaxDTO(undefined)).toBeNull();
    });

    it('should map array of product tax rows', () => {
      const dtos = toProductTaxesDTO([mockDbProductTaxRow]);
      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('15');
      expect(toProductTaxesDTO(null)).toEqual([]);
    });

    it('should map resolved tax row and identify VARIANT vs PRODUCT resolution level', () => {
      const variantResolved = toResolvedTaxDTO(mockDbProductTaxRow);
      expect(variantResolved.resolution_level).toBe('VARIANT');
      expect(variantResolved.tax_code).toBe('GST_12');

      const productResolved = toResolvedTaxDTO({
        ...mockDbProductTaxRow,
        variant_id: null,
      });
      expect(productResolved.resolution_level).toBe('PRODUCT');
    });
  });

  describe('Validation Schemas', () => {
    describe('createProductTaxSchema', () => {
      it('should validate valid variant-level product tax creation payload', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          tax_id: '3',
          is_primary: true,
          effective_from: '2026-09-01T00:00:00.000Z',
        };

        const result = createProductTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.variant_id).toBe('50');
        expect(result.data.is_primary).toBe(true);
        expect(result.data.is_active).toBe(true);
      });

      it('should allow optional variant_id and default it to null (product-wide tax)', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          tax_id: '3',
        };

        const result = createProductTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.variant_id).toBeNull();
        expect(result.data.is_primary).toBe(false);
      });

      it('should reject missing required identifiers', () => {
        expect(createProductTaxSchema.safeParse({ product_id: '25', tax_id: '3' }).success).toBe(false);
        expect(createProductTaxSchema.safeParse({ company_id: '1', tax_id: '3' }).success).toBe(false);
        expect(createProductTaxSchema.safeParse({ company_id: '1', product_id: '25' }).success).toBe(false);
      });

      it('should reject when effective_to is before or equal to effective_from', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          tax_id: '3',
          effective_from: '2026-10-01T00:00:00.000Z',
          effective_to: '2026-09-01T00:00:00.000Z',
        };

        const result = createProductTaxSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].path).toContain('effective_to');
        expect(result.error.issues[0].message).toContain('must be after effective_from');
      });
    });

    describe('updateProductTaxSchema', () => {
      it('should validate partial update payload', () => {
        const payload = {
          tax_id: '4',
          is_primary: true,
        };

        const result = updateProductTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.tax_id).toBe('4');
      });
    });

    describe('updateProductTaxStatusSchema', () => {
      it('should validate status toggle boolean', () => {
        expect(updateProductTaxStatusSchema.safeParse({ is_active: false }).success).toBe(true);
        expect(updateProductTaxStatusSchema.safeParse({ is_active: 'invalid' }).success).toBe(false);
      });
    });

    describe('resolveTaxQuerySchema', () => {
      it('should validate valid tax resolution query with variant', () => {
        const query = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          as_of: '2026-09-23T00:00:00.000Z',
        };

        const result = resolveTaxQuerySchema.safeParse(query);
        expect(result.success).toBe(true);
        expect(result.data.variant_id).toBe('50');
      });

      it('should validate valid tax resolution query without variant', () => {
        const query = {
          company_id: '1',
          product_id: '25',
        };

        const result = resolveTaxQuerySchema.safeParse(query);
        expect(result.success).toBe(true);
        expect(result.data.variant_id).toBeNull();
      });
    });

    describe('bulkAssignTaxSchema', () => {
      it('should validate bulk tax assignment payload', () => {
        const payload = {
          company_id: '1',
          tax_id: '3',
          product_ids: ['10', '11', '12'],
          is_primary: true,
        };

        const result = bulkAssignTaxSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.product_ids).toHaveLength(3);
      });

      it('should reject empty product_ids array', () => {
        const payload = {
          company_id: '1',
          tax_id: '3',
          product_ids: [],
        };

        const result = bulkAssignTaxSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('At least one product_id is required');
      });
    });

    describe('getProductTaxesQuerySchema', () => {
      it('should validate defaults and filters', () => {
        const result = getProductTaxesQuerySchema.safeParse({
          page: '2',
          limit: '15',
          is_primary: 'true',
          product_id: '25',
        });

        expect(result.success).toBe(true);
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(15);
        expect(result.data.is_primary).toBe(true);
        expect(result.data.sort_by).toBe(PRODUCT_TAX_SORT_FIELDS.ID);
      });
    });
  });
});
