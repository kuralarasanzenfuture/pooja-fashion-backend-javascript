import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import env from '../../src/config/env.js';

const SECRET = env.JWT_ACCESS_SECRET || 'local-dev-access-secret';

describe('Users API Endpoints Validation & Access Control', () => {
  const adminToken = jwt.sign({ id: 1, role: 'admin', role_code: 'ADMIN', companyId: 1 }, SECRET, {
    expiresIn: '1h',
  });

  const cashierToken = jwt.sign({ id: 2, role: 'cashier', role_code: 'CASHIER', companyId: 1 }, SECRET, {
    expiresIn: '1h',
  });

  it('GET /api/users without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authentication token required/i);
  });

  it('GET /api/users with non-admin token should return 403 Forbidden', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${cashierToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/users/not-a-number with valid token should return 400 Validation Error', async () => {
    const res = await request(app)
      .get('/api/users/not-a-number')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/users with empty body should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST /api/users with weak password should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        company_id: 1,
        username: 'testuser',
        password: '123', // too short, no uppercase
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/users with invalid username characters should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        company_id: 1,
        username: 'user with spaces!',
        password: 'ValidPassword123!',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('PATCH /api/users/:id/status with invalid status should return 400 Validation Error', async () => {
    const res = await request(app)
      .patch('/api/users/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'not-a-valid-status',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('PATCH /api/users/:id with company_id should reject with 400', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ company_id: 99 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/company_id cannot be modified/i);
  });

  it('PATCH /api/users/:id with branch_id should reject with 400', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ branch_id: 99 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/branch_id cannot be modified/i);
  });

  it('PATCH /api/users/:id with employee_id should reject with 400', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ employee_id: 99 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/employee_id cannot be modified/i);
  });

  it('PATCH /api/users/:id with role_id should reject with 400', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role_id: 99 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/role_id cannot be modified/i);
  });

  it('PATCH /api/users/:id with status should reject with 400', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/status cannot be modified through generic update/i);
  });

  it('PATCH /api/users/:id with username should reject with 400', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'newname' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/username cannot be modified/i);
  });

  it('DELETE /api/users/:id should reject hard delete with 400', async () => {
    const res = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/hard deletion of user accounts is prohibited/i);
  });

  it('PATCH /api/users/me with forbidden field should reject with 400', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ company_id: 5 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).toMatch(/company_id cannot be modified through profile update/i);
  });
});
