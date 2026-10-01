import request from 'supertest';
import app from '../../src/app.js';
import { connectDatabase, getDatabasePool } from '../../src/database/connection.js';

describe('Company Addresses API Endpoints', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    const pool = getDatabasePool();
    if (pool) {
      await pool.end();
    }
  });

  it('GET /api/company-addresses/not-a-number should return 400 for non-numeric ID', async () => {
    const res = await request(app).get('/api/company-addresses/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('GET /api/company-addresses/company/not-a-number should return 400 for non-numeric companyId', async () => {
    const res = await request(app).get('/api/company-addresses/company/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/company-addresses with empty body should fail validation with 400', async () => {
    const res = await request(app).post('/api/company-addresses').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST /api/company-addresses with invalid address_type should fail validation', async () => {
    const res = await request(app).post('/api/company-addresses').send({
      company_id: 1,
      address_type: 'invalid_type',
      address_line_1: '123 Test Street',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('PATCH /api/company-addresses/1/status with missing status should fail validation', async () => {
    const res = await request(app).patch('/api/company-addresses/1/status').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('GET /api/company-addresses with invalid query limit should fail validation', async () => {
    const res = await request(app).get('/api/company-addresses?limit=not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('GET /api/company-addresses with camelCase query params should pass validation', async () => {
    const res = await request(app).get('/api/company-addresses?companyId=1&sortBy=createdAt&sortOrder=asc&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/company-addresses/company/:companyId/primary for non-existent company returns 404', async () => {
    const res = await request(app).get('/api/company-addresses/company/99999999/primary');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
