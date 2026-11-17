import {
  generateProductTypeCode,
  DEFAULT_PRODUCT_TYPES,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
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
  getAllProductTypesQuerySchema,
  getProductTypeStatsQuerySchema,
  productTypeIdParamSchema,
  companyIdParamSchema,
  productTypeCodeParamSchema,
  checkProductTypeNameQuerySchema,
  checkProductTypeCodeQuerySchema,
  seedDefaultProductTypesSchema,
} from '../../src/modules/product-master/productTypes/productType.validation.js';
import ForbiddenError from '../../src/shared/errors/ForbiddenError.js';

describe('Product Master: Product Types Unit Tests', () => {
  describe('DEFAULT_PRODUCT_TYPES', () => {
    it('should include 5 standard apparel and fashion product types', () => {
      expect(DEFAULT_PRODUCT_TYPES.length).toBe(5);
      const codes = DEFAULT_PRODUCT_TYPES.map((pt) => pt.type_code);
      expect(codes).toContain('READY_MADE');
      expect(codes).toContain('FABRIC');
      expect(codes).toContain('ACCESSORY');
      expect(codes).toContain('FOOTWEAR');
      expect(codes).toContain('SERVICE');
    });

    it('each default product type should have code, name, stock/sale/purchase flags, and description', () => {
      DEFAULT_PRODUCT_TYPES.forEach((pt) => {
        expect(pt.type_code).toBeTruthy();
        expect(pt.type_name).toBeTruthy();
        expect(typeof pt.is_stock_item).toBe('boolean');
        expect(typeof pt.is_saleable).toBe('boolean');
        expect(typeof pt.is_purchasable).toBe('boolean');
        expect(pt.description).toBeTruthy();
      });
    });

    it('should match exact settings for physical goods vs services', () => {
      const readyMade = DEFAULT_PRODUCT_TYPES.find((pt) => pt.type_code === 'READY_MADE');
      expect(readyMade).toEqual({
        type_code: 'READY_MADE',
        type_name: 'Ready Made Garments',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        description: 'Shirts, T-shirts, jeans, sarees, dresses',
      });

      const fabric = DEFAULT_PRODUCT_TYPES.find((pt) => pt.type_code === 'FABRIC');
      expect(fabric).toEqual({
        type_code: 'FABRIC',
        type_name: 'Fabric',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        description: 'Cotton, silk, linen, textile rolls',
      });

      const accessory = DEFAULT_PRODUCT_TYPES.find((pt) => pt.type_code === 'ACCESSORY');
      expect(accessory).toEqual({
        type_code: 'ACCESSORY',
        type_name: 'Fashion Accessories',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        description: 'Belts, bags, caps, jewellery',
      });

      const footwear = DEFAULT_PRODUCT_TYPES.find((pt) => pt.type_code === 'FOOTWEAR');
      expect(footwear).toEqual({
        type_code: 'FOOTWEAR',
        type_name: 'Footwear',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        description: 'Shoes, sandals, slippers, heels',
      });

      const service = DEFAULT_PRODUCT_TYPES.find((pt) => pt.type_code === 'SERVICE');
      expect(service).toEqual({
        type_code: 'SERVICE',
        type_name: 'Services',
        is_stock_item: false,
        is_saleable: true,
        is_purchasable: false,
        description: 'Alteration, stitching, embroidery',
      });
    });
  });

  describe('generateProductTypeCode', () => {
    it('should generate uppercase snake_case product type code from name', () => {
      expect(generateProductTypeCode('Ready Made Garments')).toBe('READY_MADE_GARMENTS');
      expect(generateProductTypeCode('Bespoke & Tailoring Services')).toBe('BESPOKE_TAILORING_SERVICES');
      expect(generateProductTypeCode('100% Cotton Knits')).toBe('100_COTTON_KNITS');
    });

    it('should limit code length to 50 characters', () => {
      const longName = 'T'.repeat(75);
      const code = generateProductTypeCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });

    it('should handle empty or null input gracefully', () => {
      expect(generateProductTypeCode(null)).toBe('');
      expect(generateProductTypeCode('')).toBe('');
      expect(generateProductTypeCode(undefined)).toBe('');
    });
  });

  describe('Tenant Isolation Utilities', () => {
    it('canUserSelectCompany returns true for SUPERADMIN', () => {
      expect(canUserSelectCompany({ role: 'SUPERADMIN' })).toBe(true);
      expect(canUserSelectCompany({ roleCode: 'superadmin' })).toBe(true);
    });

    it('canUserSelectCompany returns true for platform ADMIN without companyId', () => {
      expect(canUserSelectCompany({ role: 'ADMIN' })).toBe(true);
      expect(canUserSelectCompany({ role: 'ADMIN', companyId: null })).toBe(true);
    });

    it('canUserSelectCompany returns false for tenant users bound to a company', () => {
      expect(canUserSelectCompany({ role: 'ADMIN', companyId: 1 })).toBe(false);
      expect(canUserSelectCompany({ role: 'STAFF', company_id: 2 })).toBe(false);
      expect(canUserSelectCompany(null)).toBe(false);
    });

    it('resolveEffectiveCompanyId returns user companyId for tenant users', () => {
      const tenantUser = { id: 10, role: 'STAFF', companyId: 2 };
      expect(resolveEffectiveCompanyId(tenantUser, null)).toBe(2);
      expect(resolveEffectiveCompanyId(tenantUser, 2)).toBe(2);
    });

    it('resolveEffectiveCompanyId throws ForbiddenError if tenant user tries to access another company', () => {
      const tenantUser = { id: 10, role: 'STAFF', companyId: 2 };
      expect(() => resolveEffectiveCompanyId(tenantUser, 5)).toThrow(ForbiddenError);
    });

    it('resolveEffectiveCompanyId allows superadmin to choose any company', () => {
      const superadmin = { id: 1, role: 'SUPERADMIN', companyId: 1 };
      expect(resolveEffectiveCompanyId(superadmin, 5)).toBe(5);
      expect(resolveEffectiveCompanyId(superadmin, '3')).toBe(3);
      expect(resolveEffectiveCompanyId(superadmin, null)).toBe(1);
    });
  });

  describe('Product Type Mapper', () => {
    it('toProductTypeDTO should format raw DB record to camelCase DTO', () => {
      const dbRow = {
        id: '1',
        company_id: '10',
        company_name: 'Pooja Fashion Ltd',
        type_code: 'READY_MADE',
        type_name: 'Ready Made Garments',
        description: 'Garments ready for wear',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        is_active: true,
        created_at: new Date('2026-01-01T00:00:00Z'),
        updated_at: new Date('2026-01-02T00:00:00Z'),
      };

      const dto = toProductTypeDTO(dbRow);
      expect(dto).toEqual({
        id: 1,
        companyId: 10,
        companyName: 'Pooja Fashion Ltd',
        companyCode: undefined,
        typeCode: 'READY_MADE',
        typeName: 'Ready Made Garments',
        description: 'Garments ready for wear',
        isStockItem: true,
        isSaleable: true,
        isPurchasable: true,
        isActive: true,
        createdBy: null,
        updatedBy: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });

    it('toProductTypeListDTO formats arrays properly', () => {
      const rows = [
        { id: 1, company_id: 1, type_code: 'A', type_name: 'Type A' },
        { id: 2, company_id: 1, type_code: 'B', type_name: 'Type B' },
      ];
      const list = toProductTypeListDTO(rows);
      expect(list.length).toBe(2);
      expect(list[0].typeCode).toBe('A');
      expect(list[1].typeCode).toBe('B');
    });
  });

  describe('Validation Schemas', () => {
    it('validates createProductTypeSchema successfully with required fields', () => {
      const validData = {
        company_id: 1,
        type_code: 'READY_MADE',
        type_name: 'Ready Made Garments',
        description: 'Ready made clothing',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        is_active: true,
      };
      const parsed = createProductTypeSchema.safeParse(validData);
      expect(parsed.success).toBe(true);
    });

    it('fails createProductTypeSchema with invalid type_code format', () => {
      const invalidData = {
        type_name: 'Test Type',
        type_code: 'invalid code spaces!',
      };
      const parsed = createProductTypeSchema.safeParse(invalidData);
      expect(parsed.success).toBe(false);
    });

    it('validates updateProductTypeSchema with partial payload', () => {
      const updateData = {
        type_name: 'Modified Name',
        is_stock_item: false,
      };
      const parsed = updateProductTypeSchema.safeParse(updateData);
      expect(parsed.success).toBe(true);
    });

    it('validates updateStatusSchema requiring boolean is_active', () => {
      expect(updateStatusSchema.safeParse({ is_active: true }).success).toBe(true);
      expect(updateStatusSchema.safeParse({ is_active: false }).success).toBe(true);
      expect(updateStatusSchema.safeParse({ is_active: 'yes' }).success).toBe(false);
    });

    it('validates productTypeIdParamSchema', () => {
      expect(productTypeIdParamSchema.safeParse({ id: '5' }).success).toBe(true);
      expect(productTypeIdParamSchema.safeParse({ id: '0' }).success).toBe(false);
      expect(productTypeIdParamSchema.safeParse({ id: 'abc' }).success).toBe(false);
    });

    it('validates checkProductTypeNameQuerySchema', () => {
      expect(checkProductTypeNameQuerySchema.safeParse({ type_name: 'Fabric' }).success).toBe(true);
      expect(checkProductTypeNameQuerySchema.safeParse({ type_name: '' }).success).toBe(false);
    });

    it('validates checkProductTypeCodeQuerySchema', () => {
      expect(checkProductTypeCodeQuerySchema.safeParse({ type_code: 'FABRIC' }).success).toBe(true);
      expect(checkProductTypeCodeQuerySchema.safeParse({ type_code: '' }).success).toBe(false);
    });

    it('validates seedDefaultProductTypesSchema with optional company_id', () => {
      expect(seedDefaultProductTypesSchema.safeParse({}).success).toBe(true);
      expect(seedDefaultProductTypesSchema.safeParse({ company_id: 1 }).success).toBe(true);
      expect(seedDefaultProductTypesSchema.safeParse({ company_id: 'invalid' }).success).toBe(false);
    });
  });
});
