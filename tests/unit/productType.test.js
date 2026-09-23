import {
  generateProductTypeCode,
  DEFAULT_PRODUCT_TYPES,
} from '../../src/modules/product-master/productTypes/productType.service.js';
import {
  toProductTypeDTO,
  toProductTypeListDTO,
} from '../../src/modules/product-master/productTypes/productType.mapper.js';
import {
  createProductTypeSchema,
  updateProductTypeSchema,
  updateStatusSchema,
  getProductTypesQuerySchema,
  productTypeIdParamSchema,
  companyIdParamSchema,
  typeCodeParamSchema,
} from '../../src/modules/product-master/productTypes/productType.validation.js';

describe('Product Master: Product Types Unit Tests', () => {
  describe('DEFAULT_PRODUCT_TYPES', () => {
    it('should include standard apparel retail product types', () => {
      expect(DEFAULT_PRODUCT_TYPES.length).toBeGreaterThanOrEqual(5);
      const codes = DEFAULT_PRODUCT_TYPES.map((pt) => pt.type_code);
      expect(codes).toContain('READY_MADE');
      expect(codes).toContain('FABRIC');
      expect(codes).toContain('ACCESSORY');
      expect(codes).toContain('FOOTWEAR');
      expect(codes).toContain('SERVICE');
    });

    it('should configure non-stock service item properly', () => {
      const service = DEFAULT_PRODUCT_TYPES.find((pt) => pt.type_code === 'SERVICE');
      expect(service).toBeDefined();
      expect(service.is_stock_item).toBe(false);
      expect(service.is_saleable).toBe(true);
      expect(service.is_purchasable).toBe(false);
    });
  });

  describe('generateProductTypeCode', () => {
    it('should generate uppercase snake_case type code from name', () => {
      expect(generateProductTypeCode('Ready Made Garments')).toBe('READY_MADE_GARMENTS');
      expect(generateProductTypeCode('Ethnic & Bridal Wear')).toBe('ETHNIC_BRIDAL_WEAR');
    });

    it('should limit code length to 50 characters', () => {
      const longName = 'T'.repeat(80);
      const code = generateProductTypeCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Product Type Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '10',
        company_id: '1',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-CORP',
        type_code: 'READY_MADE',
        type_name: 'Ready Made Garments',
        description: 'Finished clothing ready for customer purchase',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        is_active: true,
        created_by: '5',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toProductTypeDTO(dbRow);
      expect(dto).toEqual({
        id: 10,
        companyId: 1,
        companyName: 'Pooja Fashion Retail Ltd',
        companyCode: 'PF-CORP',
        typeCode: 'READY_MADE',
        typeName: 'Ready Made Garments',
        description: 'Finished clothing ready for customer purchase',
        isStockItem: true,
        isSaleable: true,
        isPurchasable: true,
        isActive: true,
        createdBy: 5,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toProductTypeDTO(null)).toBeNull();
      expect(toProductTypeDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toProductTypeListDTO([
        { id: 1, company_id: 1, type_code: 'READY_MADE', type_name: 'Ready Made', is_active: true },
        { id: 2, company_id: 1, type_code: 'FABRIC', type_name: 'Fabric', is_active: true },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].typeCode).toBe('READY_MADE');
      expect(list[1].typeCode).toBe('FABRIC');
    });

    it('should return empty array for invalid input in toProductTypeListDTO', () => {
      expect(toProductTypeListDTO(null)).toEqual([]);
      expect(toProductTypeListDTO(undefined)).toEqual([]);
    });
  });

  describe('Product Type Validation Schemas', () => {
    it('should validate and parse valid createProductTypeSchema payload', () => {
      const validPayload = {
        company_id: '1',
        type_code: 'ready_made',
        type_name: 'Ready Made Garments',
        description: 'Finished garments',
        is_stock_item: 'true',
        is_saleable: 1,
        is_purchasable: true,
        is_active: 'true',
      };

      const parsed = createProductTypeSchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.type_code).toBe('READY_MADE');
      expect(parsed.type_name).toBe('Ready Made Garments');
      expect(parsed.is_stock_item).toBe(true);
      expect(parsed.is_saleable).toBe(true);
      expect(parsed.is_purchasable).toBe(true);
      expect(parsed.is_active).toBe(true);
    });

    it('should fail createProductTypeSchema when required fields are missing', () => {
      expect(() => createProductTypeSchema.parse({})).toThrow();
      expect(() => createProductTypeSchema.parse({ company_id: 1 })).toThrow();
      expect(() => createProductTypeSchema.parse({ type_name: 'Ready Made' })).toThrow();
    });

    it('should fail createProductTypeSchema when type_code has invalid characters', () => {
      expect(() =>
        createProductTypeSchema.parse({
          company_id: 1,
          type_name: 'Ready Made',
          type_code: 'READY#*',
        })
      ).toThrow();
    });

    it('should validate and parse updateProductTypeSchema partial payload', () => {
      const updatePayload = {
        type_name: 'Ready-Made Garments',
        is_stock_item: false,
        is_active: false,
      };

      const parsed = updateProductTypeSchema.parse(updatePayload);
      expect(parsed.type_name).toBe('Ready-Made Garments');
      expect(parsed.is_stock_item).toBe(false);
      expect(parsed.is_active).toBe(false);
    });

    it('should validate updateStatusSchema boolean coercion', () => {
      expect(updateStatusSchema.parse({ is_active: 'true' })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 'false' })).toEqual({ is_active: false });
      expect(updateStatusSchema.parse({ is_active: 1 })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 0 })).toEqual({ is_active: false });
    });

    it('should validate params schemas', () => {
      expect(productTypeIdParamSchema.parse({ id: '40' })).toEqual({ id: 40 });
      expect(companyIdParamSchema.parse({ companyId: '8' })).toEqual({ companyId: 8 });
      expect(typeCodeParamSchema.parse({ companyId: '8', typeCode: 'fabric' })).toEqual({
        companyId: 8,
        typeCode: 'fabric',
      });
    });

    it('should parse getProductTypesQuerySchema with default pagination and sorting', () => {
      const parsed = getProductTypesQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe('type_name');
      expect(parsed.sortOrder).toBe('asc');
    });
  });
});
