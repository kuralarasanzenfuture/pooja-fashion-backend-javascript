import { jest } from '@jest/globals';
import { REALISTIC_TAXES, seedTaxes } from '../../src/database/seeders/tax.seeder.js';

describe('Tax Seeder - Standard GST Slabs & Multi-Company Execution', () => {
  describe('Standard GST Slabs Dataset Integrity', () => {
    it('should define exactly 5 standard GST tax slabs', () => {
      expect(Array.isArray(REALISTIC_TAXES)).toBe(true);
      expect(REALISTIC_TAXES.length).toBe(5);
    });

    it('should contain all 5 requested GST codes', () => {
      const codes = REALISTIC_TAXES.map((t) => t.tax_code);
      expect(codes).toEqual(['GST_0', 'GST_5', 'GST_12', 'GST_18', 'GST_28']);
    });

    it('each tax slab should have valid rates and component balance', () => {
      REALISTIC_TAXES.forEach((tax) => {
        expect(tax.tax_code).toMatch(/^GST_\d+$/);
        expect(tax.tax_name).toMatch(/^GST \d+%$/);
        expect(tax.tax_type).toBe('GST');
        expect(tax.rate).toBeGreaterThanOrEqual(0);
        expect(tax.rate).toBeLessThanOrEqual(100);
        expect(tax.cgst_rate + tax.sgst_rate).toBeCloseTo(tax.rate, 4);
        expect(tax.igst_rate).toBe(tax.rate);
        expect(tax.cess_rate).toBe(0);
        expect(tax.is_inclusive).toBe(false);
        expect(tax.is_active).toBe(true);
      });
    });

    it('should match the exact details for GST_0 (0% slab)', () => {
      const slab = REALISTIC_TAXES.find((t) => t.tax_code === 'GST_0');
      expect(slab).toEqual({
        tax_code: 'GST_0',
        tax_name: 'GST 0%',
        tax_type: 'GST',
        rate: 0.0,
        cgst_rate: 0.0,
        sgst_rate: 0.0,
        igst_rate: 0.0,
        cess_rate: 0.0,
        is_inclusive: false,
        is_active: true,
      });
    });

    it('should match the exact details for GST_5 (5% slab)', () => {
      const slab = REALISTIC_TAXES.find((t) => t.tax_code === 'GST_5');
      expect(slab).toEqual({
        tax_code: 'GST_5',
        tax_name: 'GST 5%',
        tax_type: 'GST',
        rate: 5.0,
        cgst_rate: 2.5,
        sgst_rate: 2.5,
        igst_rate: 5.0,
        cess_rate: 0.0,
        is_inclusive: false,
        is_active: true,
      });
    });

    it('should match the exact details for GST_12 (12% slab)', () => {
      const slab = REALISTIC_TAXES.find((t) => t.tax_code === 'GST_12');
      expect(slab).toEqual({
        tax_code: 'GST_12',
        tax_name: 'GST 12%',
        tax_type: 'GST',
        rate: 12.0,
        cgst_rate: 6.0,
        sgst_rate: 6.0,
        igst_rate: 12.0,
        cess_rate: 0.0,
        is_inclusive: false,
        is_active: true,
      });
    });

    it('should match the exact details for GST_18 (18% slab)', () => {
      const slab = REALISTIC_TAXES.find((t) => t.tax_code === 'GST_18');
      expect(slab).toEqual({
        tax_code: 'GST_18',
        tax_name: 'GST 18%',
        tax_type: 'GST',
        rate: 18.0,
        cgst_rate: 9.0,
        sgst_rate: 9.0,
        igst_rate: 18.0,
        cess_rate: 0.0,
        is_inclusive: false,
        is_active: true,
      });
    });

    it('should match the exact details for GST_28 (28% slab)', () => {
      const slab = REALISTIC_TAXES.find((t) => t.tax_code === 'GST_28');
      expect(slab).toEqual({
        tax_code: 'GST_28',
        tax_name: 'GST 28%',
        tax_type: 'GST',
        rate: 28.0,
        cgst_rate: 14.0,
        sgst_rate: 14.0,
        igst_rate: 28.0,
        cess_rate: 0.0,
        is_inclusive: false,
        is_active: true,
      });
    });
  });

  describe('seedTaxes Multi-Company Execution with Client Mocking', () => {
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

    it('should seed all 5 GST slabs across ALL existing companies in the database', async () => {
      const mockCompanies = [
        { id: 1, company_name: 'Pooja Fashion Main Store', company_code: 'PF-001' },
        { id: 2, company_name: 'Pooja Fashion Wholesale', company_code: 'PF-002' },
      ];

      mockClient.query.mockImplementation((queryText, values) => {
        if (typeof queryText === 'string') {
          if (queryText.includes('SELECT 1 FROM product_taxes')) {
            return Promise.resolve({ rowCount: 0, rows: [] });
          }
          if (queryText.startsWith('BEGIN') || queryText.startsWith('COMMIT')) {
            return Promise.resolve({ rowCount: 0, rows: [] });
          }
          if (queryText.includes('TRUNCATE TABLE taxes')) {
            return Promise.resolve({ rowCount: 0, rows: [] });
          }
          if (queryText.includes('FROM companies ORDER BY id ASC')) {
            return Promise.resolve({ rows: mockCompanies, rowCount: mockCompanies.length });
          }
          if (queryText.includes('SELECT id FROM taxes')) {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          if (queryText.includes('INSERT INTO taxes')) {
            return Promise.resolve({
              rows: [
                {
                  id: 600 + Math.floor(Math.random() * 100),
                  company_id: values[0],
                  tax_code: values[1],
                  tax_name: values[2],
                  tax_type: values[3],
                  rate: values[4],
                  cgst_rate: values[5],
                  sgst_rate: values[6],
                  igst_rate: values[7],
                  cess_rate: values[8],
                  is_inclusive: values[9],
                  is_active: values[10],
                },
              ],
              rowCount: 1,
            });
          }
        }
        return Promise.resolve({ rows: [], rowCount: 0 });
      });

      const result = await seedTaxes({ pool: mockPool });

      expect(mockPool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalledTimes(1);

      expect(result.totalCompanies).toBe(2);
      expect(result.totalTaxesSeeded).toBe(10);
      expect(result.companies).toHaveLength(2);
      expect(result.companies[0].taxesCount).toBe(5);
      expect(result.companies[1].taxesCount).toBe(5);
    });

    it('should update existing taxes when already present', async () => {
      const mockCompanies = [{ id: 1, company_name: 'Pooja Fashion', company_code: 'PF-001' }];

      mockClient.query.mockImplementation((queryText, values) => {
        if (typeof queryText === 'string') {
          if (queryText.includes('SELECT 1 FROM product_taxes')) {
            return Promise.resolve({ rowCount: 1, rows: [{ '1': 1 }] });
          }
          if (queryText.startsWith('BEGIN') || queryText.startsWith('COMMIT')) {
            return Promise.resolve({ rowCount: 0, rows: [] });
          }
          if (queryText.includes('FROM companies ORDER BY id ASC')) {
            return Promise.resolve({ rows: mockCompanies, rowCount: 1 });
          }
          if (queryText.includes('SELECT id FROM taxes')) {
            return Promise.resolve({ rows: [{ id: 601 }], rowCount: 1 });
          }
          if (queryText.includes('UPDATE taxes')) {
            return Promise.resolve({
              rows: [
                {
                  id: 601,
                  company_id: 1,
                  tax_code: values[0],
                  tax_name: values[1],
                  tax_type: values[2],
                  rate: values[3],
                  cgst_rate: values[4],
                  sgst_rate: values[5],
                  igst_rate: values[6],
                  cess_rate: values[7],
                  is_inclusive: values[8],
                  is_active: values[9],
                },
              ],
              rowCount: 1,
            });
          }
        }
        return Promise.resolve({ rows: [], rowCount: 0 });
      });

      const result = await seedTaxes({ pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.totalTaxesSeeded).toBe(5);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should seed taxes for a specific companyId when requested', async () => {
      mockClient.query.mockImplementation((queryText, values) => {
        if (typeof queryText === 'string') {
          if (queryText.includes('SELECT 1 FROM product_taxes')) {
            return Promise.resolve({ rowCount: 0, rows: [] });
          }
          if (queryText.startsWith('BEGIN') || queryText.startsWith('COMMIT')) {
            return Promise.resolve({ rowCount: 0, rows: [] });
          }
          if (queryText.includes('WHERE id = $1')) {
            return Promise.resolve({
              rows: [{ id: values[0], company_name: 'Target Store', company_code: 'PF-TARGET' }],
              rowCount: 1,
            });
          }
          if (queryText.includes('SELECT id FROM taxes')) {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          if (queryText.includes('INSERT INTO taxes')) {
            return Promise.resolve({
              rows: [{ id: 601, company_id: values[0], tax_code: values[1], tax_name: values[2] }],
              rowCount: 1,
            });
          }
        }
        return Promise.resolve({ rows: [], rowCount: 0 });
      });

      const result = await seedTaxes({ companyId: 99, pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.totalTaxesSeeded).toBe(5);
      expect(result.companies[0].companyId).toBe(99);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction and release client on error', async () => {
      mockClient.query.mockImplementation((queryText) => {
        if (typeof queryText === 'string') {
          if (queryText.includes('SELECT 1 FROM product_taxes')) {
            return Promise.resolve({ rowCount: 0, rows: [] });
          }
          if (queryText.startsWith('BEGIN')) {
            return Promise.resolve({ rowCount: 0, rows: [] });
          }
          if (queryText.includes('FROM companies ORDER BY id ASC')) {
            return Promise.reject(new Error('Simulated Database Crash'));
          }
        }
        return Promise.resolve({ rows: [], rowCount: 0 });
      });

      await expect(seedTaxes({ pool: mockPool })).rejects.toThrow('Simulated Database Crash');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });
});

