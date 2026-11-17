import { jest } from '@jest/globals';
import { REALISTIC_MATERIALS, seedMaterials } from '../../src/database/seeders/material.seeder.js';

describe('Material Seeder - Realistic Data & Multi-Company Execution', () => {
  describe('Realistic Dataset Integrity', () => {
    it('should define exactly 40 realistic apparel and fashion materials', () => {
      expect(Array.isArray(REALISTIC_MATERIALS)).toBe(true);
      expect(REALISTIC_MATERIALS.length).toBe(40);
    });

    it('should contain all 40 requested textile & apparel fabrics', () => {
      const materialCodes = REALISTIC_MATERIALS.map((m) => m.material_code);
      expect(materialCodes).toContain('COTTON');
      expect(materialCodes).toContain('POLYESTER');
      expect(materialCodes).toContain('SILK');
      expect(materialCodes).toContain('LINEN');
      expect(materialCodes).toContain('RAYON');
      expect(materialCodes).toContain('DENIM');
      expect(materialCodes).toContain('GEORGETTE');
      expect(materialCodes).toContain('CHIFFON');
      expect(materialCodes).toContain('VELVET');
      expect(materialCodes).toContain('WOOL');
      expect(materialCodes).toContain('NYLON');
      expect(materialCodes).toContain('ACRYLIC');
      expect(materialCodes).toContain('SPANDEX');
      expect(materialCodes).toContain('LYCRA');
      expect(materialCodes).toContain('SATIN');
      expect(materialCodes).toContain('CREPE');
      expect(materialCodes).toContain('VOILE');
      expect(materialCodes).toContain('ORGANZA');
      expect(materialCodes).toContain('NET');
      expect(materialCodes).toContain('TULLE');
      expect(materialCodes).toContain('CORDUROY');
      expect(materialCodes).toContain('CANVAS');
      expect(materialCodes).toContain('POPLIN');
      expect(materialCodes).toContain('FLANNEL');
      expect(materialCodes).toContain('JERSEY');
      expect(materialCodes).toContain('KNIT');
      expect(materialCodes).toContain('FLEECE');
      expect(materialCodes).toContain('MUSLIN');
      expect(materialCodes).toContain('KHADI');
      expect(materialCodes).toContain('KHADI-COTTON');
      expect(materialCodes).toContain('BANARASI-SILK');
      expect(materialCodes).toContain('KANJEEVARAM-SILK');
      expect(materialCodes).toContain('TUSSAR-SILK');
      expect(materialCodes).toContain('CHANDERI');
      expect(materialCodes).toContain('MAHESHWARI');
      expect(materialCodes).toContain('BROCADE');
      expect(materialCodes).toContain('LINEN-BLEND');
      expect(materialCodes).toContain('COTTON-BLEND');
      expect(materialCodes).toContain('POLY-COTTON');
      expect(materialCodes).toContain('VISCOSE');
    });

    it('each material should have valid code, name, and non-empty description', () => {
      REALISTIC_MATERIALS.forEach((m) => {
        expect(m.material_code).toMatch(/^[A-Z0-9_-]+$/);
        expect(m.material_name.trim().length).toBeGreaterThan(0);
        expect(m.description.trim().length).toBeGreaterThan(0);
        expect(m.is_active).toBe(true);
      });
    });

    it('should match the exact details for key materials', () => {
      const cotton = REALISTIC_MATERIALS.find((m) => m.material_code === 'COTTON');
      expect(cotton).toEqual({
        material_code: 'COTTON',
        material_name: 'Cotton',
        description: 'Natural breathable soft cotton fabric',
        is_active: true,
      });

      const net = REALISTIC_MATERIALS.find((m) => m.material_code === 'NET');
      expect(net).toEqual({
        material_code: 'NET',
        material_name: 'Net Fabric',
        description: 'Open mesh breathable fabric for ethnic and gowns',
        is_active: true,
      });

      const banarasi = REALISTIC_MATERIALS.find((m) => m.material_code === 'BANARASI-SILK');
      expect(banarasi).toEqual({
        material_code: 'BANARASI-SILK',
        material_name: 'Banarasi Silk',
        description: 'Opulent traditional woven silk from Varanasi',
        is_active: true,
      });
    });
  });

  describe('seedMaterials Multi-Company Execution with Client Mocking', () => {
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

    it('should seed all 40 materials across ALL existing companies in the database', async () => {
      let materialIdCounter = 1;

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
        if (typeof sql === 'string' && sql.includes('SELECT COUNT(*) AS count FROM products')) {
          return { rows: [{ count: 0 }] };
        }
        if (typeof sql === 'string' && sql.includes('TRUNCATE TABLE materials')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies ORDER BY id ASC')) {
          return { rows: existingCompanies };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM materials')) {
          // Simulate no previous record
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO materials')) {
          return {
            rows: [
              {
                id: materialIdCounter++,
                company_id: params[0],
                material_code: params[1],
                material_name: params[2],
                description: params[3],
                is_active: params[4],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedMaterials({ pool: mockPool });

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      // 2 companies seeded
      expect(result.totalCompanies).toBe(2);
      // 40 materials per company * 2 companies = 80 materials total
      expect(result.totalMaterialsSeeded).toBe(80);
      expect(result.companies.length).toBe(2);

      expect(result.companies[0].companyId).toBe(1);
      expect(result.companies[0].companyName).toBe('Pooja Fashion Shop');
      expect(result.companies[0].materialsCount).toBe(40);

      expect(result.companies[1].companyId).toBe(2);
      expect(result.companies[1].companyName).toBe('Ethnic Trendz');
      expect(result.companies[1].materialsCount).toBe(40);
    });

    it('should seed for a specific company when companyId is provided', async () => {
      let materialIdCounter = 1;

      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT COUNT(*) AS count FROM products')) {
          return { rows: [{ count: 0 }] };
        }
        if (typeof sql === 'string' && sql.includes('TRUNCATE TABLE materials')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies WHERE id = $1')) {
          return { rows: [{ id: 5, company_name: 'Fashion Hub', company_code: 'FHB005' }] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM materials')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO materials')) {
          return {
            rows: [
              {
                id: materialIdCounter++,
                company_id: params[0],
                material_code: params[1],
                material_name: params[2],
                description: params[3],
                is_active: params[4],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedMaterials({ companyId: 5, pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.totalMaterialsSeeded).toBe(40);
      expect(result.companies[0].companyId).toBe(5);
    });

    it('should update existing materials if found by code or name to avoid unique conflicts', async () => {
      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT COUNT(*) AS count FROM products')) {
          return { rows: [{ count: 1 }] }; // products exist, don't truncate
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies WHERE id = $1')) {
          return { rows: [{ id: 1, company_name: 'Pooja Fashion Shop', company_code: 'PFS001' }] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM materials')) {
          // Simulate material already exists with ID 88
          return { rows: [{ id: 88 }] };
        }
        if (typeof sql === 'string' && sql.includes('UPDATE materials')) {
          return {
            rows: [
              {
                id: params[4],
                company_id: 1,
                material_code: params[0],
                material_name: params[1],
                is_active: params[3],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedMaterials({ companyId: 1, pool: mockPool });

      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(result.totalMaterialsSeeded).toBe(40);
      expect(result.companies[0].materials[0].id).toBe(88);
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

      await expect(seedMaterials({ pool: mockPool })).rejects.toThrow('Database connection lost');
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

      await expect(seedMaterials({ pool: mockPool })).rejects.toThrow(
        'No existing companies found in database to seed materials for.'
      );
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
