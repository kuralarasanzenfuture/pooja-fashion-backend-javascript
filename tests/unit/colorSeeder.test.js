import { jest } from '@jest/globals';
import { REALISTIC_COLORS, seedColors } from '../../src/database/seeders/color.seeder.js';

describe('Color Seeder - Realistic Data & Multi-Company Execution', () => {
  describe('Realistic Dataset Integrity', () => {
    it('should define exactly 50 realistic apparel and fashion colors', () => {
      expect(Array.isArray(REALISTIC_COLORS)).toBe(true);
      expect(REALISTIC_COLORS.length).toBe(50);
    });

    it('should contain all 30 base color codes and 20 additional shade codes', () => {
      const colorCodes = REALISTIC_COLORS.map((c) => c.color_code);
      // Base colors
      expect(colorCodes).toContain('BLACK');
      expect(colorCodes).toContain('WHITE');
      expect(colorCodes).toContain('RED');
      expect(colorCodes).toContain('BLUE');
      expect(colorCodes).toContain('NAVY');
      expect(colorCodes).toContain('GREEN');
      expect(colorCodes).toContain('YELLOW');
      expect(colorCodes).toContain('PINK');
      expect(colorCodes).toContain('ORANGE');
      expect(colorCodes).toContain('PURPLE');
      expect(colorCodes).toContain('GREY');
      expect(colorCodes).toContain('BROWN');
      expect(colorCodes).toContain('MAROON');
      expect(colorCodes).toContain('BEIGE');
      expect(colorCodes).toContain('CREAM');
      expect(colorCodes).toContain('GOLD');
      expect(colorCodes).toContain('SILVER');
      expect(colorCodes).toContain('SKY-BLUE');
      expect(colorCodes).toContain('LIGHT-BLUE');
      expect(colorCodes).toContain('DARK-BLUE');
      expect(colorCodes).toContain('DARK-GREEN');
      expect(colorCodes).toContain('OLIVE');
      expect(colorCodes).toContain('LAVENDER');
      expect(colorCodes).toContain('MAGENTA');
      expect(colorCodes).toContain('TURQUOISE');
      expect(colorCodes).toContain('PEACH');
      expect(colorCodes).toContain('WINE');
      expect(colorCodes).toContain('TEAL');
      expect(colorCodes).toContain('CORAL');
      expect(colorCodes).toContain('MUSTARD');

      // Additional variations
      expect(colorCodes).toContain('RUST');
      expect(colorCodes).toContain('TAN');
      expect(colorCodes).toContain('KHAKI');
      expect(colorCodes).toContain('COFFEE');
      expect(colorCodes).toContain('CHOCOLATE');
      expect(colorCodes).toContain('CHARCOAL');
      expect(colorCodes).toContain('OFF-WHITE');
      expect(colorCodes).toContain('IVORY');
      expect(colorCodes).toContain('FUCHSIA');
      expect(colorCodes).toContain('ROSE');
      expect(colorCodes).toContain('BABY-PINK');
      expect(colorCodes).toContain('PEACOCK-BLUE');
      expect(colorCodes).toContain('SEA-GREEN');
      expect(colorCodes).toContain('MINT-GREEN');
      expect(colorCodes).toContain('LEMON-YELLOW');
      expect(colorCodes).toContain('SKY-GREY');
      expect(colorCodes).toContain('BRICK-RED');
      expect(colorCodes).toContain('ONION-PINK');
      expect(colorCodes).toContain('SANDAL');
      expect(colorCodes).toContain('MULTICOLOR');
    });

    it('should have valid 7-character uppercase hex codes for all colors except MULTICOLOR (which is null)', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      REALISTIC_COLORS.forEach((color) => {
        if (color.color_code === 'MULTICOLOR') {
          expect(color.hex_code).toBeNull();
        } else {
          expect(color.hex_code).toMatch(hexRegex);
          expect(color.hex_code).toBe(color.hex_code.toUpperCase());
        }
      });
    });

    it('should match the exact color attributes for key shades', () => {
      const black = REALISTIC_COLORS.find((c) => c.color_code === 'BLACK');
      expect(black).toEqual({
        color_code: 'BLACK',
        color_name: 'Black',
        hex_code: '#000000',
        display_order: 1,
        is_active: true,
        description: 'Classic Black',
      });

      const navy = REALISTIC_COLORS.find((c) => c.color_code === 'NAVY');
      expect(navy).toEqual({
        color_code: 'NAVY',
        color_name: 'Navy Blue',
        hex_code: '#000080',
        display_order: 5,
        is_active: true,
        description: 'Navy Blue',
      });

      const brown = REALISTIC_COLORS.find((c) => c.color_code === 'BROWN');
      expect(brown).toEqual({
        color_code: 'BROWN',
        color_name: 'Brown',
        hex_code: '#A52A2A',
        display_order: 12,
        is_active: true,
        description: 'Classic Brown',
      });

      const turquoise = REALISTIC_COLORS.find((c) => c.color_code === 'TURQUOISE');
      expect(turquoise).toEqual({
        color_code: 'TURQUOISE',
        color_name: 'Turquoise',
        hex_code: '#40E0D0',
        display_order: 25,
        is_active: true,
        description: 'Turquoise',
      });

      const mustard = REALISTIC_COLORS.find((c) => c.color_code === 'MUSTARD');
      expect(mustard).toEqual({
        color_code: 'MUSTARD',
        color_name: 'Mustard',
        hex_code: '#FFDB58',
        display_order: 30,
        is_active: true,
        description: 'Mustard',
      });

      const multicolor = REALISTIC_COLORS.find((c) => c.color_code === 'MULTICOLOR');
      expect(multicolor).toEqual({
        color_code: 'MULTICOLOR',
        color_name: 'Multicolor',
        hex_code: null,
        display_order: 50,
        is_active: true,
        description: 'Multicolor',
      });
    });

    it('should assign sequential display orders from 1 to 50', () => {
      REALISTIC_COLORS.forEach((color, index) => {
        expect(color.display_order).toBe(index + 1);
        expect(color.is_active).toBe(true);
      });
    });
  });

  describe('seedColors Multi-Company Execution with Client Mocking', () => {
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

    it('should seed all 50 colors across ALL existing companies in the database', async () => {
      let colorIdCounter = 1;

      // Mock 2 existing companies in the database
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
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies ORDER BY id ASC')) {
          return { rows: existingCompanies };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM colors')) {
          // Simulate no previous record
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO colors')) {
          return {
            rows: [
              {
                id: colorIdCounter++,
                company_id: params[0],
                color_code: params[1],
                color_name: params[2],
                hex_code: params[3],
                description: params[4],
                display_order: params[5],
                is_active: params[6],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedColors({ pool: mockPool });

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      // 2 companies seeded
      expect(result.totalCompanies).toBe(2);
      // 50 colors per company * 2 companies = 100 colors total
      expect(result.totalColorsSeeded).toBe(100);
      expect(result.companies.length).toBe(2);

      expect(result.companies[0].companyId).toBe(1);
      expect(result.companies[0].companyName).toBe('Pooja Fashion Shop');
      expect(result.companies[0].colorsCount).toBe(50);

      expect(result.companies[1].companyId).toBe(2);
      expect(result.companies[1].companyName).toBe('Ethnic Trendz');
      expect(result.companies[1].colorsCount).toBe(50);
    });

    it('should seed for a specific company when companyId is provided', async () => {
      let colorIdCounter = 1;

      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies WHERE id = $1')) {
          return { rows: [{ id: 5, company_name: 'Fashion Hub', company_code: 'FHB005' }] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM colors')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO colors')) {
          return {
            rows: [
              {
                id: colorIdCounter++,
                company_id: params[0],
                color_code: params[1],
                color_name: params[2],
                hex_code: params[3],
                description: params[4],
                display_order: params[5],
                is_active: params[6],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedColors({ companyId: 5, pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.companyId).toBe(5);
      expect(result.totalColorsSeeded).toBe(50);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should update existing record if color code or name matches', async () => {
      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') return { rows: [] };
        if (typeof sql === 'string' && sql === 'COMMIT') return { rows: [] };
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies WHERE id = $1')) {
          return { rows: [{ id: 1, company_name: 'Pooja Fashion', company_code: 'PFS001' }] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM colors')) {
          // Simulate that existing row ID 10 exists
          return { rows: [{ id: 10 }] };
        }
        if (typeof sql === 'string' && sql.includes('UPDATE colors')) {
          return {
            rows: [
              {
                id: 10,
                company_id: 1,
                color_code: params[0],
                color_name: params[1],
                hex_code: params[2],
                description: params[3],
                display_order: params[4],
                is_active: params[5],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedColors({ companyId: 1, pool: mockPool });
      expect(result.totalColorsSeeded).toBe(50);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw an error if no companies exist in database', async () => {
      mockClient.query.mockImplementation(async (sql) => {
        if (sql === 'BEGIN') return { rows: [] };
        if (sql === 'ROLLBACK') return { rows: [] };
        if (sql.includes('SELECT id, company_name, company_code FROM companies')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      await expect(seedColors({ pool: mockPool })).rejects.toThrow(
        'No existing companies found in database to seed colors for.'
      );

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction and release client when an error occurs', async () => {
      mockClient.query.mockImplementation(async (sql) => {
        if (sql === 'BEGIN') return { rows: [] };
        if (sql === 'ROLLBACK') return { rows: [] };
        if (sql.includes('SELECT id, company_name, company_code FROM companies')) {
          return { rows: [{ id: 1, company_name: 'Pooja Fashion', company_code: 'PFS001' }] };
        }
        if (sql.includes('SELECT id FROM colors')) {
          throw new Error('Database connection interrupted');
        }
        return { rows: [] };
      });

      await expect(seedColors({ pool: mockPool })).rejects.toThrow('Database connection interrupted');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
