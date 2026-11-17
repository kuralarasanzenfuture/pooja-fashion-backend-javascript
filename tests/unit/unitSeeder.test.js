import { jest } from '@jest/globals';
import { REALISTIC_UNITS, seedUnits } from '../../src/database/seeders/unit.seeder.js';

describe('Unit Seeder - Realistic Data & Multi-Company Execution', () => {
  describe('Realistic Dataset Integrity', () => {
    it('should define exactly 30 realistic apparel and fashion units', () => {
      expect(Array.isArray(REALISTIC_UNITS)).toBe(true);
      expect(REALISTIC_UNITS.length).toBe(30);
    });

    it('should contain all 30 requested units of measure', () => {
      const unitCodes = REALISTIC_UNITS.map((u) => u.unit_code);
      expect(unitCodes).toContain('PCS');
      expect(unitCodes).toContain('PAIR');
      expect(unitCodes).toContain('SET');
      expect(unitCodes).toContain('METER');
      expect(unitCodes).toContain('CM');
      expect(unitCodes).toContain('INCH');
      expect(unitCodes).toContain('KG');
      expect(unitCodes).toContain('GM');
      expect(unitCodes).toContain('BOX');
      expect(unitCodes).toContain('DOZEN');
      expect(unitCodes).toContain('PACK');
      expect(unitCodes).toContain('BUNDLE');
      expect(unitCodes).toContain('ROLL');
      expect(unitCodes).toContain('YARD');
      expect(unitCodes).toContain('FOOT');
      expect(unitCodes).toContain('LITER');
      expect(unitCodes).toContain('ML');
      expect(unitCodes).toContain('TON');
      expect(unitCodes).toContain('CARTON');
      expect(unitCodes).toContain('BAG');
      expect(unitCodes).toContain('BOTTLE');
      expect(unitCodes).toContain('CONE');
      expect(unitCodes).toContain('SPOOL');
      expect(unitCodes).toContain('SQUARE-METER');
      expect(unitCodes).toContain('SQUARE-FOOT');
      expect(unitCodes).toContain('GROSS');
      expect(unitCodes).toContain('LOT');
      expect(unitCodes).toContain('PAIR-SET');
      expect(unitCodes).toContain('KIT');
      expect(unitCodes).toContain('DOZEN-PAIR');
    });

    it('each unit should have valid decimal places between 0 and 6', () => {
      REALISTIC_UNITS.forEach((u) => {
        expect(u.unit_code).toMatch(/^[A-Z0-9_-]+$/);
        expect(u.unit_name.trim().length).toBeGreaterThan(0);
        expect(u.decimal_places).toBeGreaterThanOrEqual(0);
        expect(u.decimal_places).toBeLessThanOrEqual(6);
        expect(u.is_active).toBe(true);
      });
    });

    it('should match the exact details for key units', () => {
      const pcs = REALISTIC_UNITS.find((u) => u.unit_code === 'PCS');
      expect(pcs).toEqual({
        unit_code: 'PCS',
        unit_name: 'Pieces',
        decimal_places: 0,
        is_active: true,
      });

      const meter = REALISTIC_UNITS.find((u) => u.unit_code === 'METER');
      expect(meter).toEqual({
        unit_code: 'METER',
        unit_name: 'Meter',
        decimal_places: 2,
        is_active: true,
      });

      const kg = REALISTIC_UNITS.find((u) => u.unit_code === 'KG');
      expect(kg).toEqual({
        unit_code: 'KG',
        unit_name: 'Kilogram',
        decimal_places: 3,
        is_active: true,
      });
    });
  });

  describe('seedUnits Multi-Company Execution with Client Mocking', () => {
    let mockClient;
    let mockPool;

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      mockPool = {
        connect: jest.fn().mockResolvedValue(mockClient),
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should seed all 30 units across ALL existing companies in the database', async () => {
      let unitIdCounter = 1;

      const existingCompanies = [
        { id: 1, company_name: 'Pooja Fashion Shop', company_code: 'PFS001' },
        { id: 2, company_name: 'Ethnic Trendz', company_code: 'ETZ002' },
      ];

      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM products')) {
          return { rowCount: 0 };
        }
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM product_variants')) {
          return { rowCount: 0 };
        }
        if (typeof sql === 'string' && sql.includes('TRUNCATE TABLE units')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies ORDER BY id ASC')) {
          return { rows: existingCompanies };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM units')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO units')) {
          return {
            rows: [
              {
                id: unitIdCounter++,
                company_id: params[0],
                unit_code: params[1],
                unit_name: params[2],
                decimal_places: params[3],
                is_active: params[4],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedUnits({ pool: mockPool });

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      // 2 companies seeded
      expect(result.totalCompanies).toBe(2);
      // 30 units per company * 2 companies = 60 units total
      expect(result.totalUnitsSeeded).toBe(60);
      expect(result.companies.length).toBe(2);

      expect(result.companies[0].companyId).toBe(1);
      expect(result.companies[0].companyName).toBe('Pooja Fashion Shop');
      expect(result.companies[0].unitsCount).toBe(30);

      expect(result.companies[1].companyId).toBe(2);
      expect(result.companies[1].companyName).toBe('Ethnic Trendz');
      expect(result.companies[1].unitsCount).toBe(30);
    });

    it('should seed for a specific company when companyId is provided', async () => {
      let unitIdCounter = 1;

      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM products')) {
          return { rowCount: 0 };
        }
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM product_variants')) {
          return { rowCount: 0 };
        }
        if (typeof sql === 'string' && sql.includes('TRUNCATE TABLE units')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies WHERE id = $1')) {
          return { rows: [{ id: 3, company_name: 'Metro Retail', company_code: 'MTR003' }] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM units')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO units')) {
          return {
            rows: [
              {
                id: unitIdCounter++,
                company_id: params[0],
                unit_code: params[1],
                unit_name: params[2],
                decimal_places: params[3],
                is_active: params[4],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedUnits({ companyId: 3, pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.totalUnitsSeeded).toBe(30);
      expect(result.companies[0].companyId).toBe(3);
    });

    it('should update existing units if found by code or name to avoid unique conflicts', async () => {
      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM products')) {
          return { rowCount: 1 }; // products exist, don't truncate
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies WHERE id = $1')) {
          return { rows: [{ id: 1, company_name: 'Pooja Fashion Shop', company_code: 'PFS001' }] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM units')) {
          // Simulate unit already exists with ID 42
          return { rows: [{ id: 42 }] };
        }
        if (typeof sql === 'string' && sql.includes('UPDATE units')) {
          return {
            rows: [
              {
                id: params[4],
                company_id: 1,
                unit_code: params[0],
                unit_name: params[1],
                decimal_places: params[2],
                is_active: params[3],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedUnits({ companyId: 1, pool: mockPool });

      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(result.totalUnitsSeeded).toBe(30);
      expect(result.companies[0].units[0].id).toBe(42);
    });

    it('should rollback transaction and release client when an error occurs', async () => {
      mockClient.query.mockImplementation(async (sql) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies')) {
          throw new Error('Database connection lost');
        }
        if (typeof sql === 'string' && sql === 'ROLLBACK') {
          return { rows: [] };
        }
        return { rows: [] };
      });

      await expect(seedUnits({ pool: mockPool })).rejects.toThrow('Database connection lost');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error when no companies exist in database', async () => {
      mockClient.query.mockImplementation(async (sql) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'ROLLBACK') {
          return { rows: [] };
        }
        return { rows: [] };
      });

      await expect(seedUnits({ pool: mockPool })).rejects.toThrow(
        'No existing companies found in database to seed units for.'
      );
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
