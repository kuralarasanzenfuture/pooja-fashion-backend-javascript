import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import env from '../../src/config/env.js';

const SECRET = env.JWT_ACCESS_SECRET || 'local-dev-access-secret';

describe('Employees API Endpoints Validation & Access Control', () => {
  const adminToken = jwt.sign({ id: 1, role: 'admin', role_code: 'ADMIN' }, SECRET, {
    expiresIn: '1h',
  });

  const cashierToken = jwt.sign({ id: 2, role: 'cashier', role_code: 'CASHIER' }, SECRET, {
    expiresIn: '1h',
  });

  it('GET /api/employees without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authentication token required/i);
  });

  it('GET /api/employees with non-admin token should return 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${cashierToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  it('GET /api/employees/not-a-number should return 400 Validation Error', async () => {
    const res = await request(app)
      .get('/api/employees/not-a-number')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/employees with empty body should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST /api/employees with negative salary should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        company_id: 1,
        first_name: 'Test',
        salary_amount: -500,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/employees with invalid email format should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        company_id: 1,
        first_name: 'Test',
        email: 'invalid-email-address',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('PATCH /api/employees/:id/status with invalid status should return 400 Validation Error', async () => {
    const res = await request(app)
      .patch('/api/employees/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employment_status: 'invalid-status',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('DELETE /api/employees/not-a-number should return 400 Validation Error', async () => {
    const res = await request(app)
      .delete('/api/employees/not-a-number')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });
});
