import { describe, it, expect } from '@jest/globals';
import {
  toDiscountDTO,
  toDiscountsDTO,
} from '../../src/modules/product-master/discounts/discount.mapper.js';
import {
  createDiscountSchema,
  updateDiscountSchema,
  updateDiscountStatusSchema,
  calculateDiscountSchema,
  discountIdParamSchema,
  getDiscountsQuerySchema,
} from '../../src/modules/product-master/discounts/discount.validation.js';
import { calculateDiscount } from '../../src/modules/product-master/discounts/discount.service.js';
import {
  DISCOUNT_TYPES,
  DISCOUNT_SORT_FIELDS,
  STANDARD_DISCOUNT_TEMPLATES,
} from '../../src/modules/product-master/discounts/discount.types.js';

describe('Product Master: Discounts Unit Tests', () => {
  describe('Discount Mapper', () => {
    const mockDbDiscountRow = {
      id: 8,
      company_id: 1,
      company_name: 'Pooja Fashion Pvt Ltd',
      company_code: 'PF-001',
      discount_code: 'SEASON20',
      discount_name: 'Seasonal Sale 20%',
      discount_type: 'PERCENTAGE',
      discount_value: '20.0000',
      minimum_quantity: '2.000',
      maximum_discount: '1000.00',
      start_at: '2026-09-01T00:00:00.000Z',
      end_at: '2026-12-31T23:59:59.000Z',
      priority: 3,
      is_stackable: false,
      is_active: true,
      created_by: 2,
      created_by_name: 'Admin User',
      updated_by: 2,
      updated_by_name: 'Admin User',
      created_at: '2026-09-01T00:00:00.000Z',
      updated_at: '2026-09-01T00:00:00.000Z',
    };

    it('should map database entity to client DiscountDTO with parsed numbers', () => {
      const dto = toDiscountDTO(mockDbDiscountRow);

      expect(dto).toBeDefined();
      expect(dto.id).toBe('8');
      expect(dto.company_id).toBe('1');
      expect(dto.discount_code).toBe('SEASON20');
      expect(dto.discount_name).toBe('Seasonal Sale 20%');
      expect(dto.discount_type).toBe('PERCENTAGE');
      expect(dto.discount_value).toBe(20.0);
      expect(dto.minimum_quantity).toBe(2.0);
      expect(dto.maximum_discount).toBe(1000.0);
      expect(dto.priority).toBe(3);
      expect(dto.is_stackable).toBe(false);
      expect(dto.is_active).toBe(true);
    });

    it('should return null when input row is null or undefined', () => {
      expect(toDiscountDTO(null)).toBeNull();
      expect(toDiscountDTO(undefined)).toBeNull();
    });

    it('should map array of discount rows', () => {
      const dtos = toDiscountsDTO([mockDbDiscountRow]);
      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('8');
      expect(toDiscountsDTO(null)).toEqual([]);
    });
  });

  describe('Validation Schemas', () => {
    describe('createDiscountSchema', () => {
      it('should validate valid percentage discount payload', () => {
        const payload = {
          company_id: '1',
          discount_code: 'welcome10',
          discount_name: 'Welcome 10%',
          discount_type: 'PERCENTAGE',
          discount_value: 10,
          minimum_quantity: 1,
          maximum_discount: 500,
        };

        const result = createDiscountSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.discount_code).toBe('WELCOME10');
        expect(result.data.priority).toBe(0);
        expect(result.data.is_stackable).toBe(false);
      });

      it('should validate valid fixed amount discount payload', () => {
        const payload = {
          company_id: '1',
          discount_code: 'FLAT500',
          discount_name: 'Flat 500 Off',
          discount_type: 'FIXED_AMOUNT',
          discount_value: 500,
        };

        const result = createDiscountSchema.safeParse(payload);
        expect(result.success).toBe(true);
      });

      it('should reject missing required identifiers', () => {
        expect(createDiscountSchema.safeParse({ discount_name: 'Sale' }).success).toBe(false);
      });

      it('should reject percentage discount exceeding 100%', () => {
        const payload = {
          company_id: '1',
          discount_code: 'MEGA150',
          discount_name: 'Mega 150%',
          discount_type: 'PERCENTAGE',
          discount_value: 150,
        };

        const result = createDiscountSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Percentage discount cannot exceed 100%');
      });

      it('should reject negative discount value', () => {
        const payload = {
          company_id: '1',
          discount_code: 'NEG',
          discount_name: 'Negative',
          discount_type: 'PERCENTAGE',
          discount_value: -10,
        };

        expect(createDiscountSchema.safeParse(payload).success).toBe(false);
      });

      it('should reject when end_at is before or equal to start_at', () => {
        const payload = {
          company_id: '1',
          discount_code: 'ERR_DATE',
          discount_name: 'Date Error',
          discount_type: 'PERCENTAGE',
          discount_value: 10,
          start_at: '2026-10-01T00:00:00.000Z',
          end_at: '2026-09-01T00:00:00.000Z',
        };

        const result = createDiscountSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('end_at must be after start_at');
      });
    });

    describe('updateDiscountSchema', () => {
      it('should validate partial update payload', () => {
        const result = updateDiscountSchema.safeParse({
          discount_name: 'Revised Seasonal Sale',
          maximum_discount: 1200,
        });
        expect(result.success).toBe(true);
      });

      it('should keep omitted fields undefined to avoid database overwrites', () => {
        const result = updateDiscountSchema.safeParse({
          discount_name: 'Only Name Update',
        });
        expect(result.success).toBe(true);
        expect(result.data.minimum_quantity).toBeUndefined();
        expect(result.data.maximum_discount).toBeUndefined();
        expect(result.data.start_at).toBeUndefined();
        expect(result.data.end_at).toBeUndefined();
      });

      it('should reject percentage discount exceeding 100% on update', () => {
        const result = updateDiscountSchema.safeParse({
          discount_type: 'PERCENTAGE',
          discount_value: 120,
        });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Percentage discount cannot exceed 100%');
      });
    });

    describe('updateDiscountStatusSchema', () => {
      it('should validate boolean active status', () => {
        expect(updateDiscountStatusSchema.safeParse({ is_active: false }).success).toBe(true);
      });
    });

    describe('calculateDiscountSchema', () => {
      it('should validate calculation payload with direct type and value', () => {
        const payload = {
          amount: 2000,
          quantity: 2,
          discount_type: 'PERCENTAGE',
          discount_value: 20,
          maximum_discount: 500,
          as_of: '2026-09-23T12:00:00Z',
        };

        const result = calculateDiscountSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.quantity).toBe(2);
        expect(result.data.as_of).toBe('2026-09-23T12:00:00Z');
      });

      it('should reject calculation if both discount_id and discount_type/value are missing', () => {
        const result = calculateDiscountSchema.safeParse({ amount: 1000 });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Either discount_id or both');
      });

      it('should reject percentage calculation exceeding 100%', () => {
        const result = calculateDiscountSchema.safeParse({
          amount: 1000,
          discount_type: 'PERCENTAGE',
          discount_value: 105,
        });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Percentage discount cannot exceed 100%');
      });
    });
  });

  describe('Discount Calculation Engine', () => {
    it('should calculate uncapped percentage discount', async () => {
      const calc = await calculateDiscount({
        amount: 2000,
        quantity: 1,
        discount_type: 'PERCENTAGE',
        discount_value: 20,
      });

      expect(calc.is_applicable).toBe(true);
      expect(calc.raw_discount).toBe(400);
      expect(calc.applied_discount).toBe(400);
      expect(calc.final_amount).toBe(1600);
      expect(calc.savings_percentage).toBe(20.0);
    });

    it('should cap percentage discount when exceeding maximum_discount', async () => {
      // 20% on 10,000 = 2,000, but capped at 1,000
      const calc = await calculateDiscount({
        amount: 10000,
        quantity: 1,
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        maximum_discount: 1000,
      });

      expect(calc.is_applicable).toBe(true);
      expect(calc.raw_discount).toBe(2000);
      expect(calc.applied_discount).toBe(1000);
      expect(calc.maximum_discount_cap).toBe(1000);
      expect(calc.final_amount).toBe(9000);
      expect(calc.savings_percentage).toBe(10.0);
    });

    it('should calculate fixed amount discount', async () => {
      const calc = await calculateDiscount({
        amount: 2500,
        quantity: 1,
        discount_type: 'FIXED_AMOUNT',
        discount_value: 500,
      });

      expect(calc.is_applicable).toBe(true);
      expect(calc.applied_discount).toBe(500);
      expect(calc.final_amount).toBe(2000);
      expect(calc.savings_percentage).toBe(20.0);
    });

    it('should reject discount when quantity is less than minimum_quantity', async () => {
      const calc = await calculateDiscount({
        amount: 3000,
        quantity: 2,
        minimum_quantity: 5,
        discount_type: 'PERCENTAGE',
        discount_value: 15,
      });

      expect(calc.is_applicable).toBe(false);
      expect(calc.applied_discount).toBe(0);
      expect(calc.final_amount).toBe(3000);
      expect(calc.reason_inapplicable).toContain('Minimum quantity of 5 required');
    });

    it('should not allow discount to exceed original amount', async () => {
      // Fixed 1000 off on 600 amount -> discount capped at 600
      const calc = await calculateDiscount({
        amount: 600,
        quantity: 1,
        discount_type: 'FIXED_AMOUNT',
        discount_value: 1000,
      });

      expect(calc.is_applicable).toBe(true);
      expect(calc.applied_discount).toBe(600);
      expect(calc.final_amount).toBe(0);
      expect(calc.savings_percentage).toBe(100.0);
    });

    it('should verify standard discount promotional templates exist', () => {
      expect(STANDARD_DISCOUNT_TEMPLATES).toHaveLength(5);
      const codes = STANDARD_DISCOUNT_TEMPLATES.map((t) => t.discount_code);
      expect(codes).toContain('WELCOME10');
      expect(codes).toContain('FLAT500');
      expect(codes).toContain('SEASON20');
      expect(codes).toContain('FESTIVE25');
      expect(codes).toContain('BULK15');
    });
  });
});
