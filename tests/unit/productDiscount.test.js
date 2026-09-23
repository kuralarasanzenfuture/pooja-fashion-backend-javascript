import { describe, it, expect } from '@jest/globals';
import {
  toProductDiscountDTO,
  toProductDiscountsDTO,
  toResolvedDiscountDTO,
} from '../../src/modules/product-master/productDiscounts/productDiscount.mapper.js';
import {
  createProductDiscountSchema,
  updateProductDiscountSchema,
  updateProductDiscountStatusSchema,
  bulkAssignDiscountSchema,
  resolveDiscountQuerySchema,
  getProductDiscountsQuerySchema,
} from '../../src/modules/product-master/productDiscounts/productDiscount.validation.js';
import {
  PRODUCT_DISCOUNT_SORT_FIELDS,
} from '../../src/modules/product-master/productDiscounts/productDiscount.types.js';

describe('Product Master: Product Discounts Unit Tests', () => {
  describe('Product Discount Mapper', () => {
    const mockDbRow = {
      id: 12,
      company_id: 1,
      company_name: 'Pooja Fashion Pvt Ltd',
      company_code: 'PF-001',
      product_id: 25,
      product_name: 'Cotton Kurta',
      product_code: 'KURTA-001',
      variant_id: 50,
      variant_sku: 'KURTA-001-RED-M',
      variant_name: 'Red / Medium',
      discount_id: 3,
      discount_code: 'SEASON20',
      discount_name: 'Seasonal Sale 20%',
      discount_type: 'PERCENTAGE',
      discount_value: '20.0000',
      minimum_quantity: '2.000',
      maximum_discount: '1000.00',
      priority: 3,
      is_stackable: false,
      is_primary: true,
      is_active: true,
      created_by: 2,
      created_by_name: 'Admin User',
      updated_by: 2,
      updated_by_name: 'Admin User',
      created_at: '2026-09-01T00:00:00.000Z',
      updated_at: '2026-09-01T00:00:00.000Z',
    };

    it('should map database row to ProductDiscountDTO with parsed numbers', () => {
      const dto = toProductDiscountDTO(mockDbRow);

      expect(dto).toBeDefined();
      expect(dto.id).toBe('12');
      expect(dto.company_id).toBe('1');
      expect(dto.product_id).toBe('25');
      expect(dto.variant_id).toBe('50');
      expect(dto.discount_id).toBe('3');
      expect(dto.discount_code).toBe('SEASON20');
      expect(dto.discount_value).toBe(20.0);
      expect(dto.minimum_quantity).toBe(2.0);
      expect(dto.maximum_discount).toBe(1000.0);
      expect(dto.priority).toBe(3);
      expect(dto.is_primary).toBe(true);
      expect(dto.is_active).toBe(true);
    });

    it('should return null when input row is null or undefined', () => {
      expect(toProductDiscountDTO(null)).toBeNull();
      expect(toProductDiscountDTO(undefined)).toBeNull();
    });

    it('should map array of product discount rows', () => {
      const dtos = toProductDiscountsDTO([mockDbRow]);
      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('12');
      expect(toProductDiscountsDTO(null)).toEqual([]);
    });

    it('should map resolved row with calculation output to ResolvedDiscountDTO', () => {
      const calc = {
        original_amount: 2000,
        quantity: 2,
        raw_discount: 400,
        applied_discount: 400,
        final_amount: 1600,
        savings_percentage: 20.0,
        is_applicable: true,
        reason_inapplicable: null,
      };

      const dto = toResolvedDiscountDTO(mockDbRow, calc);
      expect(dto).toBeDefined();
      expect(dto.mapping_id).toBe('12');
      expect(dto.product_id).toBe('25');
      expect(dto.variant_id).toBe('50');
      expect(dto.discount_code).toBe('SEASON20');
      expect(dto.original_amount).toBe(2000);
      expect(dto.applied_discount).toBe(400);
      expect(dto.final_amount).toBe(1600);
      expect(dto.savings_percentage).toBe(20.0);
      expect(dto.is_applicable).toBe(true);
    });
  });

  describe('Validation Schemas', () => {
    describe('createProductDiscountSchema', () => {
      it('should validate valid variant-level mapping payload', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          discount_id: '3',
          is_primary: true,
        };

        const result = createProductDiscountSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.is_primary).toBe(true);
        expect(result.data.is_active).toBe(true);
      });

      it('should validate valid product-wide mapping without variant_id', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          discount_id: '3',
        };

        const result = createProductDiscountSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.variant_id).toBeNull();
        expect(result.data.is_primary).toBe(false);
      });

      it('should reject missing required identifiers', () => {
        expect(createProductDiscountSchema.safeParse({ company_id: '1' }).success).toBe(false);
        expect(
          createProductDiscountSchema.safeParse({ company_id: '1', product_id: '25' }).success
        ).toBe(false);
      });
    });

    describe('updateProductDiscountSchema', () => {
      it('should validate partial update payload', () => {
        const result = updateProductDiscountSchema.safeParse({
          discount_id: '5',
          is_primary: true,
        });
        expect(result.success).toBe(true);
      });

      it('should reject empty update payload', () => {
        const result = updateProductDiscountSchema.safeParse({});
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('At least one field must be provided');
      });
    });

    describe('updateProductDiscountStatusSchema', () => {
      it('should validate boolean active status', () => {
        expect(updateProductDiscountStatusSchema.safeParse({ is_active: false }).success).toBe(true);
        expect(updateProductDiscountStatusSchema.safeParse({ is_active: 'invalid' }).success).toBe(
          false
        );
      });
    });

    describe('bulkAssignDiscountSchema', () => {
      it('should validate bulk assign payload', () => {
        const payload = {
          company_id: '1',
          discount_id: '3',
          product_ids: ['25', '26', '27'],
          is_primary: true,
        };

        const result = bulkAssignDiscountSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.product_ids).toHaveLength(3);
      });

      it('should reject empty product_ids array', () => {
        const payload = {
          company_id: '1',
          discount_id: '3',
          product_ids: [],
        };

        const result = bulkAssignDiscountSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('At least one product ID must be provided');
      });
    });

    describe('resolveDiscountQuerySchema', () => {
      it('should validate resolution query parameters', () => {
        const query = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          amount: '2000.50',
          quantity: '2',
          as_of: '2026-09-23T12:00:00Z',
        };

        const result = resolveDiscountQuerySchema.safeParse(query);
        expect(result.success).toBe(true);
        expect(result.data.amount).toBe(2000.5);
        expect(result.data.quantity).toBe(2);
      });

      it('should reject invalid amount', () => {
        const query = {
          company_id: '1',
          product_id: '25',
          amount: '-500',
        };

        expect(resolveDiscountQuerySchema.safeParse(query).success).toBe(false);
      });
    });

    describe('getProductDiscountsQuerySchema', () => {
      it('should validate and parse query filters', () => {
        const query = {
          page: '2',
          limit: '50',
          company_id: '1',
          is_primary: 'TRUE',
          is_active: 'false',
        };

        const result = getProductDiscountsQuerySchema.safeParse(query);
        expect(result.success).toBe(true);
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
        expect(result.data.is_primary).toBe(true);
        expect(result.data.is_active).toBe(false);
      });
    });
  });

  describe('Sort Constants', () => {
    it('should define valid sort fields', () => {
      expect(PRODUCT_DISCOUNT_SORT_FIELDS.ID).toBe('id');
      expect(PRODUCT_DISCOUNT_SORT_FIELDS.PRODUCT_ID).toBe('product_id');
      expect(PRODUCT_DISCOUNT_SORT_FIELDS.VARIANT_ID).toBe('variant_id');
      expect(PRODUCT_DISCOUNT_SORT_FIELDS.DISCOUNT_ID).toBe('discount_id');
      expect(PRODUCT_DISCOUNT_SORT_FIELDS.PRIORITY).toBe('priority');
    });
  });
});
