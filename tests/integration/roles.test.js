import request from 'supertest';
import app from '../../src/app.js';

describe('Roles API Endpoints Validation & Routing', () => {
  it('GET /api/roles/invalid-id should return 400 for non-numeric ID', async () => {
    const res = await request(app).get('/api/roles/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('GET /api/roles/company/invalid-company-id should return 400', async () => {
    const res = await request(app).get('/api/roles/company/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/roles with empty body should fail validation with 400', async () => {
    const res = await request(app).post('/api/roles').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST /api/roles with missing role_name should fail validation', async () => {
    const res = await request(app).post('/api/roles').send({
      company_id: 1,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/roles with invalid role_code characters should fail validation', async () => {
    const res = await request(app).post('/api/roles').send({
      company_id: 1,
      role_name: 'Cashier',
      role_code: 'INVALID CODE with spaces & symbols!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('PATCH /api/roles/:id/status with invalid body should return 400', async () => {
    const res = await request(app).patch('/api/roles/1/status').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });
});
