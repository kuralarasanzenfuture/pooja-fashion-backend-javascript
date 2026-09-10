import request from 'supertest';
import app from '../../src/app.js';
import { connectDatabase, getDatabasePool } from '../../src/database/connection.js';

describe('Roles API Endpoints Validation & Routing', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    const pool = getDatabasePool();
    if (pool) {
      await pool.end();
    }
  });

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

  it('POST /api/roles with is_system_role: true and company_id should fail system scope check', async () => {
    const res = await request(app).post('/api/roles').send({
      company_id: 1,
      role_name: 'System Auditor',
      is_system_role: true,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/roles with is_system_role: false and missing company_id should fail validation', async () => {
    const res = await request(app).post('/api/roles').send({
      role_name: 'Store Cashier',
      is_system_role: false,
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

  it('GET /api/roles should return 200 with seeded system roles', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const codes = res.body.data.map((r) => r.roleCode);
    expect(codes).toContain('SUPERADMIN');
    expect(codes).toContain('ADMIN');
  });

  it('DELETE /api/roles/:id on seeded SUPERADMIN role should return 403 Forbidden', async () => {
    const listRes = await request(app).get('/api/roles?is_system_role=true');
    expect(listRes.status).toBe(200);
    const superadmin = listRes.body.data.find((r) => r.roleCode === 'SUPERADMIN');
    if (superadmin) {
      const deleteRes = await request(app).delete(`/api/roles/${superadmin.id}`);
      expect(deleteRes.status).toBe(403);
      expect(deleteRes.body.success).toBe(false);
      expect(deleteRes.body.message).toMatch(/cannot be deleted/i);
    }
  });
});
