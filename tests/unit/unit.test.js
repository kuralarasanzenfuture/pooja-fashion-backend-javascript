import {
  generateUnitCode,
  DEFAULT_UNITS,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from '../../src/modules/product-master/units/unit.service.js';
import {
  toUnitDTO,
  toUnitListDTO,
} from '../../src/modules/product-master/units/unit.mapper.js';
import {
  createUnitSchema,
  updateUnitSchema,
  updateStatusSchema,
  getUnitsQuerySchema,
  getAllUnitsQuerySchema,
  getUnitStatsQuerySchema,
  unitIdParamSchema,
  companyIdParamSchema,
  unitCodeParamSchema,
  checkUnitNameQuerySchema,
  checkUnitCodeQuerySchema,
  seedDefaultUnitsSchema,
} from '../../src/modules/product-master/units/unit.validation.js';
import ForbiddenError from '../../src/shared/errors/ForbiddenError.js';

describe('Product Master: Units Unit Tests', () => {
  describe('DEFAULT_UNITS', () => {
    it('should include 30 realistic apparel retail units of measure', () => {
      expect(DEFAULT_UNITS.length).toBe(30);
      const codes = DEFAULT_UNITS.map((u) => u.unit_code);
      expect(codes).toContain('PCS');
      expect(codes).toContain('PAIR');
      expect(codes).toContain('SET');
      expect(codes).toContain('METER');
      expect(codes).toContain('CM');
      expect(codes).toContain('INCH');
      expect(codes).toContain('KG');
      expect(codes).toContain('GM');
      expect(codes).toContain('BOX');
      expect(codes).toContain('DOZEN');
      expect(codes).toContain('PACK');
      expect(codes).toContain('BUNDLE');
      expect(codes).toContain('ROLL');
      expect(codes).toContain('YARD');
      expect(codes).toContain('SQUARE-METER');
    });

    it('should have valid decimal_places between 0 and 6', () => {
      DEFAULT_UNITS.forEach((u) => {
        expect(u.decimal_places).toBeGreaterThanOrEqual(0);
        expect(u.decimal_places).toBeLessThanOrEqual(6);
        expect(u.unit_name).toBeTruthy();
      });
    });
  });

  describe('generateUnitCode', () => {
    it('should generate uppercase snake_case unit code from name', () => {
      expect(generateUnitCode('Square Meters')).toBe('SQUARE_METERS');
      expect(generateUnitCode('Pieces (Each)')).toBe('PIECES_EACH');
      expect(generateUnitCode('Running Yards')).toBe('RUNNING_YARDS');
    });

    it('should limit code length to 30 characters', () => {
      const longName = 'U'.repeat(50);
      const code = generateUnitCode(longName);
      expect(code.length).toBeLessThanOrEqual(30);
    });

    it('should handle empty or null input gracefully', () => {
      expect(generateUnitCode(null)).toBe('');
      expect(generateUnitCode('')).toBe('');
      expect(generateUnitCode(undefined)).toBe('');
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

  describe('Unit Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '20',
        company_id: '1',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-CORP',
        unit_code: 'PCS',
        unit_name: 'Pieces',
        decimal_places: '0',
        is_active: true,
        created_by: '2',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toUnitDTO(dbRow);
      expect(dto).toEqual({
        id: 20,
        companyId: 1,
        companyName: 'Pooja Fashion Retail Ltd',
        companyCode: 'PF-CORP',
        unitCode: 'PCS',
        unitName: 'Pieces',
        decimalPlaces: 0,
        isActive: true,
        createdBy: 2,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toUnitDTO(null)).toBeNull();
      expect(toUnitDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toUnitListDTO([
        { id: 1, company_id: 1, unit_code: 'PCS', unit_name: 'Pieces', is_active: true },
        { id: 2, company_id: 1, unit_code: 'MTR', unit_name: 'Meters', is_active: true },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].unitCode).toBe('PCS');
      expect(list[1].unitCode).toBe('MTR');
    });

    it('should return empty array for invalid input in toUnitListDTO', () => {
      expect(toUnitListDTO(null)).toEqual([]);
      expect(toUnitListDTO(undefined)).toEqual([]);
    });
  });

  describe('Unit Validation Schemas', () => {
    it('should validate and parse valid createUnitSchema payload', () => {
      const validPayload = {
        company_id: '1',
        unit_code: 'mtr',
        unit_name: 'Meters',
        decimal_places: '2',
        is_active: 'true',
      };

      const parsed = createUnitSchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.unit_code).toBe('MTR');
      expect(parsed.unit_name).toBe('Meters');
      expect(parsed.decimal_places).toBe(2);
      expect(parsed.is_active).toBe(true);
    });

    it('should allow omitting company_id and unit_code in createUnitSchema (injected in service)', () => {
      const parsed = createUnitSchema.parse({ unit_name: 'Pieces' });
      expect(parsed.unit_name).toBe('Pieces');
      expect(parsed.decimal_places).toBe(0);
      expect(parsed.company_id).toBeUndefined();
      expect(parsed.unit_code).toBeUndefined();
    });

    it('should fail createUnitSchema when unit_name is empty or missing', () => {
      expect(() => createUnitSchema.parse({})).toThrow();
      expect(() => createUnitSchema.parse({ company_id: 1 })).toThrow();
      expect(() => createUnitSchema.parse({ unit_name: '' })).toThrow();
      expect(() => createUnitSchema.parse({ unit_name: '   ' })).toThrow();
    });

    it('should fail createUnitSchema when decimal_places is out of range', () => {
      expect(() =>
        createUnitSchema.parse({
          company_id: 1,
          unit_name: 'Pieces',
          decimal_places: 7, // Max is 6
        })
      ).toThrow();

      expect(() =>
        createUnitSchema.parse({
          company_id: 1,
          unit_name: 'Pieces',
          decimal_places: -1, // Min is 0
        })
      ).toThrow();
    });

    it('should fail createUnitSchema when unit_code has invalid characters', () => {
      expect(() =>
        createUnitSchema.parse({
          company_id: 1,
          unit_name: 'Pieces',
          unit_code: 'PCS#*',
        })
      ).toThrow();
    });

    it('should validate and parse updateUnitSchema partial payload', () => {
      const updatePayload = {
        unit_name: 'Linear Meters',
        decimal_places: 3,
        is_active: false,
      };

      const parsed = updateUnitSchema.parse(updatePayload);
      expect(parsed.unit_name).toBe('Linear Meters');
      expect(parsed.decimal_places).toBe(3);
      expect(parsed.is_active).toBe(false);
    });

    it('should validate updateStatusSchema boolean coercion', () => {
      expect(updateStatusSchema.parse({ is_active: 'true' })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 'false' })).toEqual({ is_active: false });
      expect(updateStatusSchema.parse({ is_active: 1 })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 0 })).toEqual({ is_active: false });
    });

    it('should validate params schemas', () => {
      expect(unitIdParamSchema.parse({ id: '30' })).toEqual({ id: 30 });
      expect(companyIdParamSchema.parse({ companyId: '5' })).toEqual({ companyId: 5 });
      expect(unitCodeParamSchema.parse({ companyId: '5', unitCode: 'pcs' })).toEqual({
        companyId: 5,
        unitCode: 'pcs',
      });
    });

    it('should parse getUnitsQuerySchema with default pagination and sorting', () => {
      const parsed = getUnitsQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe('unit_name');
      expect(parsed.sortOrder).toBe('asc');
    });

    it('should validate checkUnitNameQuerySchema and checkUnitCodeQuerySchema', () => {
      const parsedName = checkUnitNameQuerySchema.parse({ name: 'Boxes', companyId: '1' });
      expect(parsedName.name).toBe('Boxes');
      expect(parsedName.companyId).toBe(1);

      const parsedCode = checkUnitCodeQuerySchema.parse({ code: 'BOX', company_id: '1' });
      expect(parsedCode.code).toBe('BOX');
      expect(parsedCode.company_id).toBe(1);

      expect(() => checkUnitNameQuerySchema.parse({ companyId: 1 })).toThrow();
      expect(() => checkUnitCodeQuerySchema.parse({ companyId: 1 })).toThrow();
    });

    it('should validate getAllUnitsQuerySchema and seedDefaultUnitsSchema', () => {
      const parsedAll = getAllUnitsQuerySchema.parse({ company_id: '2', is_active: 'true' });
      expect(parsedAll.company_id).toBe(2);
      expect(parsedAll.is_active).toBe(true);

      const parsedStats = getUnitStatsQuerySchema.parse({ companyId: '3' });
      expect(parsedStats.companyId).toBe(3);

      const parsedSeed = seedDefaultUnitsSchema.parse({ company_id: '1' });
      expect(parsedSeed.company_id).toBe(1);
    });
  });
});
