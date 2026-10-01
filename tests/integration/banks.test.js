import request from 'supertest';
import app from '../../src/app.js';
import { connectDatabase, getDatabasePool } from '../../src/database/connection.js';

describe('Banks & Company Banks Module API Integration Tests', () => {
  let pool;
  let testCompanyId;
  let testBankId;
  let testIdentifierId;
  let testCompanyBankId;

  beforeAll(async () => {
    await connectDatabase();
    pool = getDatabasePool();

    // Create a temporary test company
    const compRes = await pool.query(
      `INSERT INTO companies (company_code, company_name, email, phone, status)
       VALUES ('TEST-BANK-CO', 'Test Banking Company', 'bank@test.com', '9876543210', 'active')
       RETURNING id`
    );
    testCompanyId = Number(compRes.rows[0].id);
  });

  afterAll(async () => {
    if (testCompanyBankId) {
      await pool.query('DELETE FROM company_banks WHERE id = $1', [testCompanyBankId]);
    }
    if (testIdentifierId) {
      await pool.query('DELETE FROM bank_identifiers WHERE id = $1', [testIdentifierId]);
    }
    if (testBankId) {
      await pool.query('DELETE FROM banks WHERE id = $1', [testBankId]);
    }
    if (testCompanyId) {
      await pool.query('DELETE FROM companies WHERE id = $1', [testCompanyId]);
    }
  });

  describe('1. Bank Master (/banks)', () => {
    it('should create a bank master record with camelCase payload', async () => {
      const res = await request(app)
        .post('/api/banks')
        .send({
          bankCode: 'TSTBK',
          bankName: 'Test Apex Bank',
          shortName: 'TAB',
          legalName: 'Test Apex Bank Limited',
          bankType: 'commercial',
          countryCode: 'IN',
          isActive: true,
          isVerified: true,
          displayOrder: 1,
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bankCode).toBe('TSTBK');
      testBankId = res.body?.data?.id;
    });

    it('should retrieve list of banks', async () => {
      const res = await request(app).get('/api/banks?search=Test Apex');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should retrieve bank by ID', async () => {
      const res = await request(app).get(`/api/banks/${testBankId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testBankId);
    });

    it('should update bank with partial PATCH', async () => {
      const res = await request(app)
        .patch(`/api/banks/${testBankId}`)
        .send({
          shortName: 'TAB-UPDATED',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.shortName).toBe('TAB-UPDATED');
    });

    it('should update bank status', async () => {
      const res = await request(app)
        .patch(`/api/banks/${testBankId}/status`)
        .send({ isActive: false });
      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);

      // Re-enable
      await request(app)
        .patch(`/api/banks/${testBankId}/status`)
        .send({ isActive: true });
    });
  });

  describe('2. Bank Identifiers (/bank-identifiers)', () => {
    it('should create a bank identifier with camelCase payload', async () => {
      const res = await request(app)
        .post('/api/bank-identifiers')
        .send({
          bankId: testBankId,
          identifierType: 'ifsc',
          identifierValue: 'TSTB0000001',
          branchName: 'Corporate Hub Branch',
          city: 'Mumbai',
          state: 'Maharashtra',
          isActive: true,
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.identifierValue).toBe('TSTB0000001');
      testIdentifierId = res.body.data.id;
    });

    it('should get identifier by value', async () => {
      const res = await request(app).get('/api/bank-identifiers/value/TSTB0000001');
      expect(res.status).toBe(200);
      expect(res.body.data.identifierValue).toBe('TSTB0000001');
    });

    it('should get all identifiers for bank', async () => {
      const res = await request(app).get(`/api/bank-identifiers/bank/${testBankId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('3. Company Bank Accounts (/company-banks)', () => {
    it('should create a company bank account with camelCase payload', async () => {
      const res = await request(app)
        .post('/api/company-banks')
        .send({
          companyId: testCompanyId,
          bankId: testBankId,
          accountName: 'Test Banking Company Main Current',
          accountNumber: '99887766554433',
          accountType: 'current',
          branchName: 'Corporate Hub Branch',
          branchCode: '001',
          ifscCode: 'TSTB0000001',
          openingBalance: 50000,
          isPrimary: true,
          isActive: true,
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accountNumber).toBe('99887766554433');
      expect(res.body.data.isPrimary).toBe(true);
      testCompanyBankId = res.body.data.id;
    });

    it('should get bank accounts by company ID', async () => {
      const res = await request(app).get(`/api/company-banks/company/${testCompanyId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('should get primary bank account by company ID', async () => {
      const res = await request(app).get(`/api/company-banks/company/${testCompanyId}/primary`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testCompanyBankId);
      expect(res.body.data.isPrimary).toBe(true);
    });

    it('should update company bank account with PATCH', async () => {
      const res = await request(app)
        .patch(`/api/company-banks/${testCompanyBankId}`)
        .send({
          branchName: 'Corporate Headquarters Branch',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.branchName).toBe('Corporate Headquarters Branch');
    });

    it('should set company bank as primary', async () => {
      const res = await request(app)
        .patch(`/api/company-banks/${testCompanyBankId}/primary`);
      expect(res.status).toBe(200);
      expect(res.body.data.isPrimary).toBe(true);
    });

    it('should update status of company bank', async () => {
      const res = await request(app)
        .patch(`/api/company-banks/${testCompanyBankId}/status`)
        .send({ isActive: false });
      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });
  });
});
