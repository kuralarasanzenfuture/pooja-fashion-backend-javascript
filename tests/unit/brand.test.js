import {
  generateBrandCode,
  extractUploadedLogo,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  toSlug,
} from '../../src/modules/product-master/brands/brand.service.js';
import * as brandUtils from '../../src/modules/product-master/brands/utils/index.js';
import {
  toBrandDTO,
  toBrandListDTO,
} from '../../src/modules/product-master/brands/brand.mapper.js';
import {
  createBrandSchema,
  updateBrandSchema,
  getBrandsQuerySchema,
  getAllBrandsQuerySchema,
  getBrandStatsQuerySchema,
  reorderBrandsSchema,
  checkBrandNameQuerySchema,
  checkBrandCodeQuerySchema,
} from '../../src/modules/product-master/brands/brand.validation.js';

describe('Product Master: Brands Unit Tests', () => {
  describe('generateBrandCode', () => {
    it('should generate uppercase snake_case brand code from name', () => {
      expect(generateBrandCode('Puma Sports')).toBe('PUMA_SPORTS');
      expect(generateBrandCode("Levi's & Strauss!")).toBe('LEVI_S_STRAUSS_');
      expect(generateBrandCode('Zara-Clothing')).toBe('ZARA_CLOTHING');
    });

    it('should limit brand code length to 50 characters', () => {
      const longName = 'B'.repeat(80);
      const code = generateBrandCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });

    it('should handle non-string or empty input safely', () => {
      expect(generateBrandCode('')).toBe('');
      expect(generateBrandCode(null)).toBe('');
      expect(generateBrandCode(undefined)).toBe('');
    });
  });

  describe('extractUploadedLogo', () => {
    it('should extract logo path when logo file is supplied', () => {
      const files = {
        logo: [{ filename: 'puma-logo.webp' }],
      };
      const result = extractUploadedLogo(files, 'puma');
      expect(result).toEqual({
        logo_url: '/uploads/brands/puma/puma-logo.webp',
        logo_key: 'brands/puma/puma-logo.webp',
      });
    });

    it('should support logo_url field from files', () => {
      const files = {
        logo_url: [{ filename: 'zara-logo.png' }],
      };
      const result = extractUploadedLogo(files, 'zara');
      expect(result).toEqual({
        logo_url: '/uploads/brands/zara/zara-logo.png',
        logo_key: 'brands/zara/zara-logo.png',
      });
    });

    it('should support image field fallback from files', () => {
      const files = {
        image: [{ filename: 'nike-logo.svg' }],
      };
      const result = extractUploadedLogo(files, 'nike');
      expect(result).toEqual({
        logo_url: '/uploads/brands/nike/nike-logo.svg',
        logo_key: 'brands/nike/nike-logo.svg',
      });
    });

    it('should return empty object when no files are uploaded', () => {
      expect(extractUploadedLogo(null)).toEqual({});
      expect(extractUploadedLogo({})).toEqual({});
    });
  });

  describe('Brand Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '15',
        company_id: '1',
        company_name: 'Pooja Fashion Retail',
        company_code: 'PF-01',
        brand_code: 'FABINDIA',
        brand_name: 'FabIndia',
        description: 'Ethnic handcrafted fashion brand',
        logo_url: '/uploads/brands/fabindia/logo.png',
        logo_key: 'brands/fabindia/logo.png',
        website_url: 'https://fabindia.com',
        display_order: 2,
        is_active: true,
        created_by: '3',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toBrandDTO(dbRow);
      expect(dto).toEqual({
        id: 15,
        companyId: 1,
        companyName: 'Pooja Fashion Retail',
        companyCode: 'PF-01',
        brandCode: 'FABINDIA',
        brandName: 'FabIndia',
        description: 'Ethnic handcrafted fashion brand',
        logoUrl: '/uploads/brands/fabindia/logo.png',
        logoKey: 'brands/fabindia/logo.png',
        websiteUrl: 'https://fabindia.com',
        displayOrder: 2,
        isActive: true,
        createdBy: 3,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toBrandDTO(null)).toBeNull();
      expect(toBrandDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toBrandListDTO([
        { id: 1, company_id: 1, brand_code: 'B1', brand_name: 'Brand 1', display_order: 0, is_active: true },
        { id: 2, company_id: 1, brand_code: 'B2', brand_name: 'Brand 2', display_order: 1, is_active: false },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].brandCode).toBe('B1');
      expect(list[1].brandCode).toBe('B2');
    });

    it('should return empty array for invalid input in toBrandListDTO', () => {
      expect(toBrandListDTO(null)).toEqual([]);
      expect(toBrandListDTO(undefined)).toEqual([]);
    });
  });

  describe('Brand Validation Schemas', () => {
    it('should validate and parse valid createBrandSchema payload', () => {
      const validPayload = {
        company_id: '1',
        brand_code: 'puma_sports',
        brand_name: 'Puma Sports',
        description: 'Global athletic apparel',
        website_url: 'https://puma.com',
        display_order: '3',
        is_active: 'true',
      };

      const parsed = createBrandSchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.brand_code).toBe('PUMA_SPORTS');
      expect(parsed.brand_name).toBe('Puma Sports');
      expect(parsed.website_url).toBe('https://puma.com');
      expect(parsed.display_order).toBe(3);
      expect(parsed.is_active).toBe(true);
    });

    it('should allow omitting company_id in createBrandSchema for token resolution', () => {
      const payload = {
        brand_name: 'Local Boutique',
      };
      const parsed = createBrandSchema.parse(payload);
      expect(parsed.brand_name).toBe('Local Boutique');
      expect(parsed.company_id).toBeUndefined();
    });

    it('should fail validation when brand_name is missing in createBrandSchema', () => {
      expect(() => createBrandSchema.parse({})).toThrow();
      expect(() => createBrandSchema.parse({ brand_name: '   ' })).toThrow();
    });

    it('should validate and parse updateBrandSchema payload', () => {
      const payload = {
        brand_name: 'Updated Name',
        is_active: 'false',
        display_order: '5',
      };
      const parsed = updateBrandSchema.parse(payload);
      expect(parsed.brand_name).toBe('Updated Name');
      expect(parsed.is_active).toBe(false);
      expect(parsed.display_order).toBe(5);
    });

    it('should validate getBrandsQuerySchema with defaults and has_logo filter', () => {
      const parsed = getBrandsQuerySchema.parse({ has_logo: 'true' });
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.has_logo).toBe(true);
      expect(parsed.sortBy).toBe('display_order');
      expect(parsed.sortOrder).toBe('asc');
    });

    it('should validate getAllBrandsQuerySchema with optional parameters', () => {
      const parsed = getAllBrandsQuerySchema.parse({
        company_id: '2',
        is_active: 'true',
        has_logo: 'false',
        search: 'puma',
        sortBy: 'brand_name',
        sortOrder: 'desc',
      });
      expect(parsed.company_id).toBe(2);
      expect(parsed.is_active).toBe(true);
      expect(parsed.has_logo).toBe(false);
      expect(parsed.search).toBe('puma');
      expect(parsed.sortBy).toBe('brand_name');
      expect(parsed.sortOrder).toBe('desc');
    });

    it('should validate getBrandStatsQuerySchema with optional company_id', () => {
      const parsed = getBrandStatsQuerySchema.parse({
        company_id: '5',
      });
      expect(parsed.company_id).toBe(5);
    });

    it('should validate reorderBrandsSchema with items array', () => {
      const parsed = reorderBrandsSchema.parse({
        items: [
          { id: 10, display_order: 0 },
          { id: 20, display_order: 1 },
        ],
      });
      expect(parsed.items).toHaveLength(2);
      expect(parsed.items[0].id).toBe(10);
      expect(parsed.items[0].display_order).toBe(0);

      expect(() => reorderBrandsSchema.parse({ items: [] })).toThrow();
      expect(() => reorderBrandsSchema.parse({})).toThrow();
    });

    it('should validate checkBrandNameQuerySchema with name and company_id', () => {
      const parsed = checkBrandNameQuerySchema.parse({
        name: 'Nike',
        company_id: '1',
        excludeId: '3',
      });
      expect(parsed.name).toBe('Nike');
      expect(parsed.company_id).toBe(1);
      expect(parsed.excludeId).toBe(3);

      expect(() => checkBrandNameQuerySchema.parse({})).toThrow();
      expect(() => checkBrandNameQuerySchema.parse({ name: '   ' })).toThrow();
    });

    it('should validate checkBrandCodeQuerySchema with code and company_id', () => {
      const parsed = checkBrandCodeQuerySchema.parse({
        code: 'NIKE',
        company_id: '1',
      });
      expect(parsed.code).toBe('NIKE');
      expect(parsed.company_id).toBe(1);

      expect(() => checkBrandCodeQuerySchema.parse({})).toThrow();
      expect(() => checkBrandCodeQuerySchema.parse({ code: '' })).toThrow();
    });
  });

  describe('Company Isolation & Security Helpers', () => {
    it('canUserSelectCompany correctly distinguishes superadmin, admin, and tenant users', () => {
      expect(canUserSelectCompany(null)).toBe(false);
      expect(canUserSelectCompany({ role: 'SUPERADMIN' })).toBe(true);
      expect(canUserSelectCompany({ roleCode: 'SUPERADMIN' })).toBe(true);
      expect(canUserSelectCompany({ role: 'ADMIN' })).toBe(true);
      expect(canUserSelectCompany({ role: 'ADMIN', companyId: 1 })).toBe(false);
      expect(canUserSelectCompany({ role: 'BRANCH_MANAGER', companyId: 2 })).toBe(false);
      expect(canUserSelectCompany({ role: 'CASHIER', company_id: 3 })).toBe(false);
    });

    it('resolveEffectiveCompanyId locks tenant users strictly to their company_id', () => {
      // SuperAdmin can choose any company or null
      expect(resolveEffectiveCompanyId({ role: 'SUPERADMIN' }, '5')).toBe(5);
      expect(resolveEffectiveCompanyId({ role: 'SUPERADMIN' }, null)).toBeNull();

      // Tenant user with companyId 1 requesting nothing gets 1
      expect(resolveEffectiveCompanyId({ role: 'CASHIER', companyId: 1 })).toBe(1);
      expect(resolveEffectiveCompanyId({ role: 'STAFF', company_id: 2 })).toBe(2);

      // Tenant user requesting their own companyId is allowed
      expect(resolveEffectiveCompanyId({ role: 'STAFF', companyId: 1 }, '1')).toBe(1);

      // Tenant user attempting cross-tenant access to another company is blocked
      expect(() =>
        resolveEffectiveCompanyId({ role: 'CASHIER', companyId: 1 }, '2')
      ).toThrow('You do not have permission to access brands for another company');
    });
  });

  describe('Brands Utils Module (src/modules/product-master/brands/utils)', () => {
    it('should export all brand utility functions from brand.utils.js and index.js', () => {
      expect(typeof brandUtils.generateBrandCode).toBe('function');
      expect(typeof brandUtils.toSlug).toBe('function');
      expect(typeof brandUtils.extractUploadedLogo).toBe('function');
      expect(typeof brandUtils.canUserSelectCompany).toBe('function');
      expect(typeof brandUtils.resolveEffectiveCompanyId).toBe('function');
      expect(typeof brandUtils.default).toBe('object');
    });

    it('should format URL-friendly slugs using toSlug', () => {
      expect(brandUtils.toSlug('Puma & Adidas Footwear')).toBe('puma-adidas-footwear');
    });
  });
});
