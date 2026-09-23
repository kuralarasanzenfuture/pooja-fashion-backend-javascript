import { jest } from '@jest/globals';
import { generateProductCode } from '../../src/modules/product-master/products/product.service.js';
import {
  toProductDTO,
  toProductListDTO,
} from '../../src/modules/product-master/products/product.mapper.js';
import {
  createProductSchema,
  updateProductSchema,
  updateStatusSchema,
  getProductsQuerySchema,
  productIdParamSchema,
  companyIdParamSchema,
  productCodeParamSchema,
} from '../../src/modules/product-master/products/product.validation.js';

describe('Product Master: Products Unit Tests', () => {
  describe('generateProductCode', () => {
    it('should generate uppercase snake_case product code from name', () => {
      expect(generateProductCode('Embroidered Silk Anarkali Suit')).toBe('EMBROIDERED_SILK_ANARKALI_SUIT');
      expect(generateProductCode('Women Floral Kurti & Pant Set')).toBe('WOMEN_FLORAL_KURTI_PANT_SET');
    });

    it('should trim and limit code length to 50 characters', () => {
      const longName = 'A'.repeat(80);
      const code = generateProductCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Product Mapper', () => {
    it('should map database entity to client DTO format with nested relations', () => {
      const dbRow = {
        id: '1',
        company_id: '10',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-CORP',
        product_code: 'SILK_ANARKALI_01',
        product_name: 'Embroidered Silk Anarkali Suit',
        category_id: '2',
        category_name: 'Women Ethnic',
        category_code: 'WOMEN_ETHNIC',
        subcategory_id: '5',
        subcategory_name: 'Anarkali Suits',
        subcategory_code: 'ANARKALI',
        brand_id: '3',
        brand_name: 'Pooja Exclusive',
        brand_code: 'POOJA_EXCL',
        product_type_id: '4',
        type_name: 'Ready-made Garments',
        type_code: 'READY_MADE',
        description: 'Premium quality silk',
        short_description: 'Silk anarkali suit',
        manufacturer_name: 'Pooja Crafts',
        manufacturer_part_no: 'PC-001',
        default_unit_id: '6',
        unit_name: 'Piece',
        unit_code: 'PCS',
        unit_symbol: 'pc',
        is_variant_product: true,
        track_stock: true,
        allow_negative_stock: false,
        is_active: true,
        created_by: '1',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toProductDTO(dbRow);
      expect(dto).toBeDefined();
      expect(dto.id).toBe(1);
      expect(dto.company_id).toBe(10);
      expect(dto.company).toEqual({
        id: 10,
        name: 'Pooja Fashion Retail Ltd',
        code: 'PF-CORP',
      });
      expect(dto.product_code).toBe('SILK_ANARKALI_01');
      expect(dto.product_name).toBe('Embroidered Silk Anarkali Suit');
      expect(dto.category).toEqual({
        id: 2,
        name: 'Women Ethnic',
        code: 'WOMEN_ETHNIC',
      });
      expect(dto.subcategory).toEqual({
        id: 5,
        name: 'Anarkali Suits',
        code: 'ANARKALI',
      });
      expect(dto.brand).toEqual({
        id: 3,
        name: 'Pooja Exclusive',
        code: 'POOJA_EXCL',
      });
      expect(dto.product_type).toEqual({
        id: 4,
        name: 'Ready-made Garments',
        code: 'READY_MADE',
      });
      expect(dto.default_unit).toEqual({
        id: 6,
        name: 'Piece',
        code: 'PCS',
        symbol: 'pc',
      });
      expect(dto.is_variant_product).toBe(true);
      expect(dto.track_stock).toBe(true);
      expect(dto.allow_negative_stock).toBe(false);
      expect(dto.is_active).toBe(true);
    });

    it('should handle null optional relations gracefully', () => {
      const dbRow = {
        id: '2',
        company_id: '10',
        product_code: 'BASIC_TEE',
        product_name: 'Basic Cotton T-Shirt',
        category_id: '2',
        subcategory_id: null,
        brand_id: null,
        product_type_id: null,
        default_unit_id: '6',
        is_variant_product: false,
        track_stock: true,
        allow_negative_stock: false,
        is_active: true,
      };

      const dto = toProductDTO(dbRow);
      expect(dto.id).toBe(2);
      expect(dto.subcategory_id).toBeNull();
      expect(dto.subcategory).toBeNull();
      expect(dto.brand_id).toBeNull();
      expect(dto.brand).toBeNull();
      expect(dto.product_type_id).toBeNull();
      expect(dto.product_type).toBeNull();
    });

    it('should return null when input row is null or undefined', () => {
      expect(toProductDTO(null)).toBeNull();
      expect(toProductDTO(undefined)).toBeNull();
    });

    it('should transform array of database entities', () => {
      const rows = [
        { id: 1, company_id: 1, product_code: 'P1', product_name: 'Item 1', category_id: 1, default_unit_id: 1 },
        { id: 2, company_id: 1, product_code: 'P2', product_name: 'Item 2', category_id: 1, default_unit_id: 1 },
      ];
      const list = toProductListDTO(rows);
      expect(list.length).toBe(2);
      expect(list[0].id).toBe(1);
      expect(list[1].id).toBe(2);
    });

    it('should return empty array for non-array or empty input', () => {
      expect(toProductListDTO(null)).toEqual([]);
      expect(toProductListDTO([])).toEqual([]);
    });
  });

  describe('Validation Schemas', () => {
    describe('createProductSchema', () => {
      it('should validate and parse valid product creation payload', () => {
        const payload = {
          company_id: '1',
          product_code: 'silk-suit-01',
          product_name: 'Embroidered Silk Suit',
          category_id: '2',
          subcategory_id: '3',
          brand_id: '4',
          product_type_id: '5',
          description: 'A luxurious suit',
          short_description: 'Luxury suit',
          manufacturer_name: 'Fashion Hub',
          manufacturer_part_no: 'FH-100',
          default_unit_id: '6',
          is_variant_product: 'true',
          track_stock: 1,
          allow_negative_stock: 'false',
          is_active: 'true',
        };

        const result = createProductSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.company_id).toBe(1);
        expect(result.data.product_code).toBe('SILK-SUIT-01');
        expect(result.data.category_id).toBe(2);
        expect(result.data.default_unit_id).toBe(6);
        expect(result.data.is_variant_product).toBe(true);
        expect(result.data.track_stock).toBe(true);
        expect(result.data.allow_negative_stock).toBe(false);
      });

      it('should allow optional product_code and optional relational IDs', () => {
        const payload = {
          company_id: 1,
          product_name: 'Simple Cotton Saree',
          category_id: 2,
          default_unit_id: 3,
        };

        const result = createProductSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.product_code).toBeUndefined();
        expect(result.data.is_variant_product).toBe(true); // default
        expect(result.data.track_stock).toBe(true); // default
        expect(result.data.allow_negative_stock).toBe(false); // default
        expect(result.data.is_active).toBe(true); // default
      });

      it('should reject missing required fields', () => {
        expect(createProductSchema.safeParse({}).success).toBe(false);
        expect(createProductSchema.safeParse({ company_id: 1 }).success).toBe(false);
        expect(createProductSchema.safeParse({ company_id: 1, product_name: 'Kurta' }).success).toBe(false);
        expect(
          createProductSchema.safeParse({ company_id: 1, product_name: 'Kurta', category_id: 2 }).success
        ).toBe(false);
      });

      it('should reject invalid product_code characters', () => {
        const payload = {
          company_id: 1,
          product_code: 'INVALID CODE!',
          product_name: 'Kurta',
          category_id: 2,
          default_unit_id: 3,
        };
        const result = createProductSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });
    });

    describe('updateProductSchema', () => {
      it('should validate partial update payload', () => {
        const payload = {
          product_name: 'Updated Cotton Saree',
          track_stock: false,
          allow_negative_stock: true,
        };
        const result = updateProductSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.product_name).toBe('Updated Cotton Saree');
        expect(result.data.track_stock).toBe(false);
        expect(result.data.allow_negative_stock).toBe(true);
      });
    });

    describe('updateStatusSchema', () => {
      it('should validate boolean status with preprocessing', () => {
        expect(updateStatusSchema.safeParse({ is_active: 'true' }).data.is_active).toBe(true);
        expect(updateStatusSchema.safeParse({ is_active: 0 }).data.is_active).toBe(false);
        expect(updateStatusSchema.safeParse({}).success).toBe(false);
      });
    });

    describe('Param and Query Schemas', () => {
      it('should validate productIdParamSchema', () => {
        expect(productIdParamSchema.safeParse({ id: '123' }).data.id).toBe(123);
        expect(productIdParamSchema.safeParse({ id: '-5' }).success).toBe(false);
      });

      it('should validate companyIdParamSchema', () => {
        expect(companyIdParamSchema.safeParse({ companyId: '10' }).data.companyId).toBe(10);
      });

      it('should validate productCodeParamSchema', () => {
        const result = productCodeParamSchema.safeParse({ companyId: '1', productCode: 'SILK_01' });
        expect(result.success).toBe(true);
        expect(result.data.companyId).toBe(1);
        expect(result.data.productCode).toBe('SILK_01');
      });

      it('should validate getProductsQuerySchema with defaults', () => {
        const query = getProductsQuerySchema.parse({});
        expect(query.page).toBe(1);
        expect(query.limit).toBe(10);
        expect(query.sortBy).toBe('product_name');
        expect(query.sortOrder).toBe('asc');
      });

      it('should reject invalid sortBy in getProductsQuerySchema', () => {
        const result = getProductsQuerySchema.safeParse({ sortBy: 'unknown_column' });
        expect(result.success).toBe(false);
      });
    });
  });
});
