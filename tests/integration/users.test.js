import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import env from '../../src/config/env.js';

const SECRET = env.JWT_ACCESS_SECRET || 'local-dev-access-secret';

describe('Users API Endpoints Validation & Access Control', () => {
  const adminToken = jwt.sign({ id: 1, role: 'admin', role_code: 'ADMIN' }, SECRET, {
    expiresIn: '1h',
  });

  const cashierToken = jwt.sign({ id: 2, role: 'cashier', role_code: 'CASHIER' }, SECRET, {
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
});
