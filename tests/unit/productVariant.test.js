import { generateSku } from '../../src/modules/product-master/productVariants/productVariant.service.js';
import {
  toProductVariantDTO,
  toProductVariantListDTO,
} from '../../src/modules/product-master/productVariants/productVariant.mapper.js';
import {
  createProductVariantSchema,
  updateProductVariantSchema,
  updateStatusSchema,
  setDefaultVariantSchema,
  variantIdParamSchema,
  productIdParamSchema,
  skuParamSchema,
  getProductVariantsQuerySchema,
} from '../../src/modules/product-master/productVariants/productVariant.validation.js';

describe('Product Master: Product Variants Unit Tests', () => {
  describe('generateSku', () => {
    it('should generate standard uppercase SKU from attributes', () => {
      const sku = generateSku({
        productCode: 'SILK_ANK',
        sizeCode: 'M',
        colorCode: 'RED',
        materialCode: 'SLK',
      });
      expect(sku).toBe('SILK_ANK-M-RED-SLK');
    });

    it('should generate fallback SKU when attribute codes are omitted', () => {
      const sku = generateSku({ productCode: 'KURTI_01' });
      expect(sku.startsWith('KURTI_01-VAR-')).toBe(true);
    });

    it('should generate random SKU when all arguments are empty', () => {
      const sku = generateSku({});
      expect(sku.startsWith('SKU-')).toBe(true);
    });

    it('should sanitize special characters and limit to 100 characters', () => {
      const sku = generateSku({
        productCode: 'PROD#@!123',
        sizeCode: 'XL++',
      });
      expect(sku).not.toContain('@');
      expect(sku).not.toContain('#');
      expect(sku.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Product Variant Mapper', () => {
    it('should map database entity to client DTO format with nested relations', () => {
      const dbRow = {
        id: '5',
        company_id: '1',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-CORP',
        product_id: '10',
        product_name: 'Embroidered Silk Anarkali Suit',
        product_code: 'SILK_ANARKALI_01',
        sku: 'SILK-ANK-M-RED',
        variant_code: 'M-RED',
        variant_name: 'Silk Anarkali - M / Red',
        size_group_id: '2',
        size_group_name: 'Women Standard',
        size_group_code: 'WOMEN_STD',
        size_id: '4',
        size_name: 'Medium',
        size_code: 'M',
        color_id: '3',
        color_name: 'Royal Red',
        color_code: 'RED_ROYAL',
        color_hex_code: '#C41E3A',
        material_id: '6',
        material_name: 'Pure Mulberry Silk',
        material_code: 'SILK_MUL',
        unit_id: '1',
        unit_name: 'Piece',
        unit_code: 'PCS',
        unit_symbol: 'pc',
        model_no: 'MDL-2026',
        style_code: 'STL-01',
        weight: '0.650000',
        track_stock: true,
        allow_negative_stock: false,
        is_default: true,
        is_active: true,
        created_by: '1',
        updated_by: null,
        created_at: '2026-09-22T12:00:00.000Z',
        updated_at: '2026-09-22T12:00:00.000Z',
      };

      const dto = toProductVariantDTO(dbRow);
      expect(dto).toBeDefined();
      expect(dto.id).toBe(5);
      expect(dto.company_id).toBe(1);
      expect(dto.company).toEqual({
        id: 1,
        name: 'Pooja Fashion Retail Ltd',
        code: 'PF-CORP',
      });
      expect(dto.product_id).toBe(10);
      expect(dto.product).toEqual({
        id: 10,
        name: 'Embroidered Silk Anarkali Suit',
        code: 'SILK_ANARKALI_01',
      });
      expect(dto.sku).toBe('SILK-ANK-M-RED');
      expect(dto.size_group).toEqual({
        id: 2,
        name: 'Women Standard',
        code: 'WOMEN_STD',
      });
      expect(dto.size).toEqual({
        id: 4,
        name: 'Medium',
        code: 'M',
      });
      expect(dto.color).toEqual({
        id: 3,
        name: 'Royal Red',
        code: 'RED_ROYAL',
        hex_code: '#C41E3A',
      });
      expect(dto.material).toEqual({
        id: 6,
        name: 'Pure Mulberry Silk',
        code: 'SILK_MUL',
      });
      expect(dto.unit).toEqual({
        id: 1,
        name: 'Piece',
        code: 'PCS',
        symbol: 'pc',
      });
      expect(dto.weight).toBe(0.65);
      expect(dto.is_default).toBe(true);
      expect(dto.is_active).toBe(true);
    });

    it('should handle null optional relations gracefully', () => {
      const dbRow = {
        id: '6',
        company_id: '1',
        product_id: '10',
        sku: 'SIMPLE-SKU-01',
        unit_id: '1',
        size_group_id: null,
        size_id: null,
        color_id: null,
        material_id: null,
        weight: null,
        track_stock: true,
        allow_negative_stock: false,
        is_default: false,
        is_active: true,
      };

      const dto = toProductVariantDTO(dbRow);
      expect(dto.id).toBe(6);
      expect(dto.size_group_id).toBeNull();
      expect(dto.size_group).toBeNull();
      expect(dto.size_id).toBeNull();
      expect(dto.size).toBeNull();
      expect(dto.color_id).toBeNull();
      expect(dto.color).toBeNull();
      expect(dto.material_id).toBeNull();
      expect(dto.material).toBeNull();
      expect(dto.weight).toBeNull();
      expect(dto.is_default).toBe(false);
    });

    it('should return null when input row is null or undefined', () => {
      expect(toProductVariantDTO(null)).toBeNull();
      expect(toProductVariantDTO(undefined)).toBeNull();
    });

    it('should map array of database rows', () => {
      const rows = [
        { id: 1, company_id: 1, product_id: 1, sku: 'SKU1', unit_id: 1 },
        { id: 2, company_id: 1, product_id: 1, sku: 'SKU2', unit_id: 1 },
      ];
      const list = toProductVariantListDTO(rows);
      expect(list.length).toBe(2);
      expect(list[0].id).toBe(1);
      expect(list[1].id).toBe(2);
    });

    it('should return empty array for non-array input', () => {
      expect(toProductVariantListDTO(null)).toEqual([]);
      expect(toProductVariantListDTO([])).toEqual([]);
    });
  });

  describe('Validation Schemas', () => {
    describe('createProductVariantSchema', () => {
      it('should validate and parse valid variant creation payload', () => {
        const payload = {
          company_id: '1',
          product_id: '10',
          sku: 'silk-ank-m-red',
          variant_code: 'M-RED',
          variant_name: 'Silk Anarkali M / Red',
          size_group_id: '1',
          size_id: '2',
          color_id: '3',
          material_id: '4',
          unit_id: '5',
          model_no: 'M-1',
          style_code: 'S-1',
          weight: '0.75',
          track_stock: 'true',
          allow_negative_stock: 'false',
          is_default: 'true',
          is_active: 1,
        };

        const result = createProductVariantSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.company_id).toBe(1);
        expect(result.data.product_id).toBe(10);
        expect(result.data.sku).toBe('SILK-ANK-M-RED');
        expect(result.data.weight).toBe(0.75);
        expect(result.data.is_default).toBe(true);
        expect(result.data.is_active).toBe(true);
      });

      it('should allow optional SKU, attributes, and default flags', () => {
        const payload = {
          company_id: 1,
          product_id: 10,
        };

        const result = createProductVariantSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.sku).toBeUndefined();
        expect(result.data.is_default).toBe(false);
        expect(result.data.is_active).toBe(true);
        expect(result.data.track_stock).toBe(true);
      });

      it('should reject missing company_id or product_id', () => {
        expect(createProductVariantSchema.safeParse({}).success).toBe(false);
        expect(createProductVariantSchema.safeParse({ company_id: 1 }).success).toBe(false);
        expect(createProductVariantSchema.safeParse({ product_id: 1 }).success).toBe(false);
      });

      it('should reject negative weight', () => {
        const payload = {
          company_id: 1,
          product_id: 10,
          weight: -0.5,
        };
        const result = createProductVariantSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it('should reject invalid SKU characters', () => {
        const payload = {
          company_id: 1,
          product_id: 10,
          sku: 'SKU WITH SPACES!',
        };
        const result = createProductVariantSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });
    });

    describe('updateProductVariantSchema', () => {
      it('should validate partial update payload', () => {
        const payload = {
          variant_name: 'Updated Variant Name',
          weight: 1.25,
          allow_negative_stock: true,
        };
        const result = updateProductVariantSchema.safeParse(payload);
        expect(result.success).toBe(true);
        expect(result.data.variant_name).toBe('Updated Variant Name');
        expect(result.data.weight).toBe(1.25);
        expect(result.data.allow_negative_stock).toBe(true);
      });
    });

    describe('updateStatusSchema & setDefaultVariantSchema', () => {
      it('should validate status update boolean', () => {
        expect(updateStatusSchema.safeParse({ is_active: 'false' }).data.is_active).toBe(false);
        expect(updateStatusSchema.safeParse({ is_active: 1 }).data.is_active).toBe(true);
        expect(updateStatusSchema.safeParse({}).success).toBe(false);
      });

      it('should validate setDefaultVariantSchema with default true', () => {
        expect(setDefaultVariantSchema.safeParse({}).data.is_default).toBe(true);
        expect(setDefaultVariantSchema.safeParse({ is_default: false }).data.is_default).toBe(false);
      });
    });

    describe('Param and Query Schemas', () => {
      it('should validate variantIdParamSchema', () => {
        expect(variantIdParamSchema.safeParse({ id: '99' }).data.id).toBe(99);
        expect(variantIdParamSchema.safeParse({ id: '0' }).success).toBe(false);
      });

      it('should validate productIdParamSchema', () => {
        expect(productIdParamSchema.safeParse({ productId: '15' }).data.productId).toBe(15);
      });

      it('should validate skuParamSchema', () => {
        const res = skuParamSchema.safeParse({ companyId: '1', sku: 'SKU-001' });
        expect(res.success).toBe(true);
        expect(res.data.sku).toBe('SKU-001');
      });

      it('should validate getProductVariantsQuerySchema with default sorting', () => {
        const query = getProductVariantsQuerySchema.parse({});
        expect(query.page).toBe(1);
        expect(query.limit).toBe(10);
        expect(query.sortBy).toBe('sku');
        expect(query.sortOrder).toBe('asc');
      });

      it('should reject invalid sortBy in getProductVariantsQuerySchema', () => {
        expect(getProductVariantsQuerySchema.safeParse({ sortBy: 'invalid_col' }).success).toBe(false);
      });
    });
  });
});
