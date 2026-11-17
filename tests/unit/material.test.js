import {
  generateMaterialCode,
  DEFAULT_MATERIALS,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from '../../src/modules/product-master/materials/material.service.js';
import {
  toMaterialDTO,
  toMaterialListDTO,
} from '../../src/modules/product-master/materials/material.mapper.js';
import {
  createMaterialSchema,
  updateMaterialSchema,
  updateStatusSchema,
  getMaterialsQuerySchema,
  getAllMaterialsQuerySchema,
  getMaterialStatsQuerySchema,
  materialIdParamSchema,
  companyIdParamSchema,
  materialCodeParamSchema,
  checkMaterialNameQuerySchema,
  checkMaterialCodeQuerySchema,
  seedDefaultMaterialsSchema,
} from '../../src/modules/product-master/materials/material.validation.js';
import ForbiddenError from '../../src/shared/errors/ForbiddenError.js';

describe('Product Master: Materials Unit Tests', () => {
  describe('DEFAULT_MATERIALS', () => {
    it('should include 40 realistic textile and apparel fabric materials', () => {
      expect(DEFAULT_MATERIALS.length).toBe(40);
      const names = DEFAULT_MATERIALS.map((m) => m.material_name);
      expect(names).toContain('Cotton');
      expect(names).toContain('Polyester');
      expect(names).toContain('Silk');
      expect(names).toContain('Linen');
      expect(names).toContain('Denim');
      expect(names).toContain('Rayon');
      expect(names).toContain('Georgette');
      expect(names).toContain('Chiffon');
      expect(names).toContain('Satin');
      expect(names).toContain('Velvet');
      expect(names).toContain('Wool');
      expect(names).toContain('Khadi');
      expect(names).toContain('Viscose');
      expect(names).toContain('Net Fabric');
    });

    it('each default material should have code, name, and description', () => {
      DEFAULT_MATERIALS.forEach((m) => {
        expect(m.material_code).toBeTruthy();
        expect(m.material_name).toBeTruthy();
        expect(m.description).toBeTruthy();
      });
    });
  });

  describe('generateMaterialCode', () => {
    it('should generate uppercase snake_case material code from name', () => {
      expect(generateMaterialCode('Pure Silk')).toBe('PURE_SILK');
      expect(generateMaterialCode('Cotton & Linen Blend')).toBe('COTTON_LINEN_BLEND');
      expect(generateMaterialCode('100% Organic Denim')).toBe('100_ORGANIC_DENIM');
    });

    it('should limit code length to 50 characters', () => {
      const longName = 'M'.repeat(75);
      const code = generateMaterialCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });

    it('should handle empty or null input gracefully', () => {
      expect(generateMaterialCode(null)).toBe('');
      expect(generateMaterialCode('')).toBe('');
      expect(generateMaterialCode(undefined)).toBe('');
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
      const superadmin = { id: 1, role: 'SUPERADMIN' };
      expect(resolveEffectiveCompanyId(superadmin, 5)).toBe(5);
      expect(resolveEffectiveCompanyId(superadmin, null)).toBeNull();
    });
  });

  describe('Material Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '15',
        company_id: '1',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-CORP',
        material_code: 'COTTON',
        material_name: '100% Pure Cotton',
        description: 'Soft breathable natural organic cotton fiber',
        is_active: true,
        created_by: '3',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toMaterialDTO(dbRow);
      expect(dto).toEqual({
        id: 15,
        companyId: 1,
        companyName: 'Pooja Fashion Retail Ltd',
        companyCode: 'PF-CORP',
        materialCode: 'COTTON',
        materialName: '100% Pure Cotton',
        description: 'Soft breathable natural organic cotton fiber',
        isActive: true,
        createdBy: 3,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toMaterialDTO(null)).toBeNull();
      expect(toMaterialDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toMaterialListDTO([
        { id: 1, company_id: 1, material_code: 'COTTON', material_name: 'Cotton', is_active: true },
        { id: 2, company_id: 1, material_code: 'SILK', material_name: 'Silk', is_active: true },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].materialCode).toBe('COTTON');
      expect(list[1].materialCode).toBe('SILK');
    });

    it('should return empty array for invalid input in toMaterialListDTO', () => {
      expect(toMaterialListDTO(null)).toEqual([]);
      expect(toMaterialListDTO(undefined)).toEqual([]);
    });
  });

  describe('Material Validation Schemas', () => {
    it('should validate and parse valid createMaterialSchema payload', () => {
      const validPayload = {
        company_id: '1',
        material_code: 'denim',
        material_name: 'Raw Indigo Denim',
        description: 'Heavyweight twill cotton denim',
        is_active: 'true',
      };

      const parsed = createMaterialSchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.material_code).toBe('DENIM');
      expect(parsed.material_name).toBe('Raw Indigo Denim');
      expect(parsed.is_active).toBe(true);
    });

    it('should allow omitting company_id and material_code in createMaterialSchema (injected in service)', () => {
      const parsed = createMaterialSchema.parse({ material_name: 'Silk' });
      expect(parsed.material_name).toBe('Silk');
      expect(parsed.company_id).toBeUndefined();
      expect(parsed.material_code).toBeUndefined();
    });

    it('should fail createMaterialSchema when material_name is empty or missing', () => {
      expect(() => createMaterialSchema.parse({})).toThrow();
      expect(() => createMaterialSchema.parse({ company_id: 1 })).toThrow();
      expect(() => createMaterialSchema.parse({ material_name: '' })).toThrow();
      expect(() => createMaterialSchema.parse({ material_name: '   ' })).toThrow();
    });

    it('should fail createMaterialSchema when material_code has invalid characters', () => {
      expect(() =>
        createMaterialSchema.parse({
          company_id: 1,
          material_name: 'Cotton',
          material_code: 'COTTON#*',
        })
      ).toThrow();
    });

    it('should validate and parse updateMaterialSchema partial payload', () => {
      const updatePayload = {
        material_name: '100% Combed Cotton',
        description: 'Smooth ring-spun cotton',
        is_active: false,
      };

      const parsed = updateMaterialSchema.parse(updatePayload);
      expect(parsed.material_name).toBe('100% Combed Cotton');
      expect(parsed.description).toBe('Smooth ring-spun cotton');
      expect(parsed.is_active).toBe(false);
    });

    it('should validate updateStatusSchema boolean coercion', () => {
      expect(updateStatusSchema.parse({ is_active: 'true' })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 'false' })).toEqual({ is_active: false });
      expect(updateStatusSchema.parse({ is_active: 1 })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 0 })).toEqual({ is_active: false });
    });

    it('should validate params schemas', () => {
      expect(materialIdParamSchema.parse({ id: '25' })).toEqual({ id: 25 });
      expect(companyIdParamSchema.parse({ companyId: '7' })).toEqual({ companyId: 7 });
      expect(materialCodeParamSchema.parse({ companyId: '7', materialCode: 'cotton' })).toEqual({
        companyId: 7,
        materialCode: 'cotton',
      });
    });

    it('should parse getMaterialsQuerySchema with default pagination and sorting', () => {
      const parsed = getMaterialsQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe('material_name');
      expect(parsed.sortOrder).toBe('asc');
    });

    it('should validate checkMaterialNameQuerySchema and checkMaterialCodeQuerySchema', () => {
      const parsedName = checkMaterialNameQuerySchema.parse({ name: 'Chiffon', companyId: '1' });
      expect(parsedName.name).toBe('Chiffon');
      expect(parsedName.companyId).toBe(1);

      const parsedCode = checkMaterialCodeQuerySchema.parse({ code: 'CHIFFON', company_id: '1' });
      expect(parsedCode.code).toBe('CHIFFON');
      expect(parsedCode.company_id).toBe(1);

      expect(() => checkMaterialNameQuerySchema.parse({ companyId: 1 })).toThrow();
      expect(() => checkMaterialCodeQuerySchema.parse({ companyId: 1 })).toThrow();
    });

    it('should validate getAllMaterialsQuerySchema and seedDefaultMaterialsSchema', () => {
      const parsedAll = getAllMaterialsQuerySchema.parse({ company_id: '2', is_active: 'true' });
      expect(parsedAll.company_id).toBe(2);
      expect(parsedAll.is_active).toBe(true);

      const parsedStats = getMaterialStatsQuerySchema.parse({ companyId: '3' });
      expect(parsedStats.companyId).toBe(3);

      const parsedSeed = seedDefaultMaterialsSchema.parse({ company_id: '1' });
      expect(parsedSeed.company_id).toBe(1);
    });
  });
});
