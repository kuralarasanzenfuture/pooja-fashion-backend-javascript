import { describe, it, expect } from '@jest/globals';
import {
  toProductPriceDTO,
  toProductPricesDTO,
  toProductPriceHistoryDTO,
  toProductPriceHistoriesDTO,
} from '../../src/modules/product-master/productPrices/productPrice.mapper.js';
import {
  createProductPriceSchema,
  updateProductPriceSchema,
  updatePriceStatusSchema,
  getCurrentPriceQuerySchema,
  getProductPricesQuerySchema,
  getPriceHistoryQuerySchema,
  priceIdParamSchema,
} from '../../src/modules/product-master/productPrices/productPrice.validation.js';
import {
  PRICE_TYPES,
  PRODUCT_PRICE_SORT_FIELDS,
  PRODUCT_PRICE_HISTORY_SORT_FIELDS,
} from '../../src/modules/product-master/productPrices/productPrice.types.js';

describe('Product Master: Product Prices & Price History Unit Tests', () => {
  describe('Product Price Mapper', () => {
    const mockDbPriceRow = {
      id: 10,
      company_id: 1,
      company_name: 'Pooja Fashion Pvt Ltd',
      product_id: 25,
      product_name: 'Silk Anarkali Kurti',
      product_item_code: 'SAK-001',
      variant_id: 50,
      variant_sku: 'SAK-RED-XL',
      variant_name: 'Red / XL',
      price_type: 'RETAIL',
      purchase_price: '650.00',
      cost_price: '720.50',
      mrp: '1999.00',
      selling_price: '1499.00',
      min_selling_price: '1299.00',
      currency_code: 'INR',
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

    it('should map database entity to client DTO format with parsed numbers', () => {
      const dto = toProductPriceDTO(mockDbPriceRow);

      expect(dto).toBeDefined();
      expect(dto.id).toBe('10');
      expect(dto.company_id).toBe('1');
      expect(dto.company_name).toBe('Pooja Fashion Pvt Ltd');
      expect(dto.product_id).toBe('25');
      expect(dto.variant_id).toBe('50');
      expect(dto.variant_sku).toBe('SAK-RED-XL');
      expect(dto.purchase_price).toBe(650.0);
      expect(dto.cost_price).toBe(720.5);
      expect(dto.mrp).toBe(1999.0);
      expect(dto.selling_price).toBe(1499.0);
      expect(dto.min_selling_price).toBe(1299.0);
      expect(dto.currency_code).toBe('INR');
      expect(dto.is_active).toBe(true);
      expect(dto.effective_to).toBeNull();
    });

    it('should return null when input row is null or undefined', () => {
      expect(toProductPriceDTO(null)).toBeNull();
      expect(toProductPriceDTO(undefined)).toBeNull();
    });

    it('should map array of price rows correctly', () => {
      const dtos = toProductPricesDTO([mockDbPriceRow]);
      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('10');
    });

    it('should return empty array for non-array input', () => {
      expect(toProductPricesDTO(null)).toEqual([]);
      expect(toProductPricesDTO(undefined)).toEqual([]);
    });

    const mockDbHistoryRow = {
      id: 101,
      company_id: 1,
      company_name: 'Pooja Fashion Pvt Ltd',
      product_id: 25,
      product_name: 'Silk Anarkali Kurti',
      product_item_code: 'SAK-001',
      variant_id: 50,
      variant_sku: 'SAK-RED-XL',
      variant_name: 'Red / XL',
      product_price_id: 10,
      price_type: 'RETAIL',
      old_purchase_price: '600.00',
      new_purchase_price: '650.00',
      old_cost_price: '700.00',
      new_cost_price: '720.50',
      old_mrp: '1899.00',
      new_mrp: '1999.00',
      old_selling_price: '1399.00',
      new_selling_price: '1499.00',
      reason: 'Raw material price increase',
      changed_by: 2,
      changed_by_name: 'Admin User',
      changed_at: '2026-09-15T10:30:00.000Z',
    };

    it('should map price history entity to client DTO format', () => {
      const historyDTO = toProductPriceHistoryDTO(mockDbHistoryRow);

      expect(historyDTO).toBeDefined();
      expect(historyDTO.id).toBe('101');
      expect(historyDTO.product_price_id).toBe('10');
      expect(historyDTO.price_type).toBe('RETAIL');
      expect(historyDTO.old_purchase_price).toBe(600.0);
      expect(historyDTO.new_purchase_price).toBe(650.0);
      expect(historyDTO.old_selling_price).toBe(1399.0);
      expect(historyDTO.new_selling_price).toBe(1499.0);
      expect(historyDTO.reason).toBe('Raw material price increase');
      expect(historyDTO.changed_by).toBe('2');
    });

    it('should map array of price history rows', () => {
      const dtos = toProductPriceHistoriesDTO([mockDbHistoryRow]);
      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('101');
      expect(toProductPriceHistoriesDTO(null)).toEqual([]);
    });
  });

  describe('Validation Schemas', () => {
    describe('createProductPriceSchema', () => {
      it('should validate valid price creation payload', () => {
        const validPayload = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          price_type: 'RETAIL',
          purchase_price: 650,
          cost_price: 720.5,
          mrp: 1999,
          selling_price: 1499,
          min_selling_price: 1299,
          effective_from: '2026-09-01T00:00:00.000Z',
          effective_to: '2026-12-31T23:59:59.000Z',
          reason: 'Initial price catalog entry',
        };

        const result = createProductPriceSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
        expect(result.data.currency_code).toBe('INR');
        expect(result.data.is_active).toBe(true);
      });

      it('should reject missing required identifiers', () => {
        const payload = {
          price_type: 'RETAIL',
          selling_price: 1499,
        };

        const result = createProductPriceSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it('should reject when selling_price exceeds mrp', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          price_type: 'RETAIL',
          mrp: 1000,
          selling_price: 1200,
        };

        const result = createProductPriceSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].path).toContain('selling_price');
        expect(result.error.issues[0].message).toContain('cannot exceed mrp');
      });

      it('should reject when min_selling_price exceeds selling_price', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          price_type: 'RETAIL',
          mrp: 2000,
          selling_price: 1500,
          min_selling_price: 1600,
        };

        const result = createProductPriceSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].path).toContain('min_selling_price');
        expect(result.error.issues[0].message).toContain('cannot exceed selling_price');
      });

      it('should reject when effective_to is before or equal to effective_from', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          price_type: 'RETAIL',
          effective_from: '2026-10-01T00:00:00.000Z',
          effective_to: '2026-09-01T00:00:00.000Z',
        };

        const result = createProductPriceSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].path).toContain('effective_to');
        expect(result.error.issues[0].message).toContain('must be after effective_from');
      });

      it('should reject negative price values', () => {
        const payload = {
          company_id: '1',
          product_id: '25',
          variant_id: '50',
          price_type: 'RETAIL',
          selling_price: -50,
        };

        const result = createProductPriceSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });
    });

    describe('updateProductPriceSchema', () => {
      it('should validate valid partial update payload', () => {
        const payload = {
          selling_price: 1399,
          reason: 'Promotional discount',
        };

        const result = updateProductPriceSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.selling_price).toBe(1399);
      });

      it('should reject update if selling_price exceeds mrp', () => {
        const payload = {
          mrp: 1000,
          selling_price: 1200,
        };

        const result = updateProductPriceSchema.safeParse(payload);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].path).toContain('selling_price');
      });
    });

    describe('updatePriceStatusSchema', () => {
      it('should validate active status toggle with reason', () => {
        const result = updatePriceStatusSchema.safeParse({
          is_active: false,
          reason: 'Discontinued seasonal price',
        });
        expect(result.success).toBe(true);
        expect(result.data.is_active).toBe(false);
      });
    });

    describe('Query & Param Schemas', () => {
      it('should validate priceIdParamSchema', () => {
        expect(priceIdParamSchema.safeParse({ id: '123' }).success).toBe(true);
        expect(priceIdParamSchema.safeParse({ id: 'abc' }).success).toBe(false);
      });

      it('should validate getCurrentPriceQuerySchema defaults', () => {
        const result = getCurrentPriceQuerySchema.safeParse({ variant_id: '50' });
        expect(result.success).toBe(true);
        expect(result.data.price_type).toBe(PRICE_TYPES.RETAIL);
      });

      it('should validate getProductPricesQuerySchema defaults and filters', () => {
        const result = getProductPricesQuerySchema.safeParse({
          page: '2',
          limit: '15',
          is_active: 'true',
          price_type: 'wholesale',
        });

        expect(result.success).toBe(true);
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(15);
        expect(result.data.is_active).toBe(true);
        expect(result.data.price_type).toBe('WHOLESALE');
        expect(result.data.sort_by).toBe(PRODUCT_PRICE_SORT_FIELDS.EFFECTIVE_FROM);
      });

      it('should validate getPriceHistoryQuerySchema', () => {
        const result = getPriceHistoryQuerySchema.safeParse({
          variant_id: '50',
          sort_by: PRODUCT_PRICE_HISTORY_SORT_FIELDS.CHANGED_AT,
        });

        expect(result.success).toBe(true);
        expect(result.data.variant_id).toBe('50');
      });
    });
  });
});
