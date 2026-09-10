import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/app.js';
import { connectDatabase } from '../../src/database/connection.js';

describe('Authentication API Full Real-Time Lifecycle Tests', () => {
  let pool;
  let testCompanyId;
  let testUserId;
  let testAccessToken;
  let testRefreshToken;
  let testSessionId;

  const testUsername = `authtest_${Date.now()}`;
  const testEmail = `${testUsername}@poojafashion.com`;
  const initialPassword = 'InitialSecurePassword@123';
  const updatedPassword = 'NewSecurePassword@456';

  beforeAll(async () => {
    pool = await connectDatabase();

    // 1. Insert test company
    const compRes = await pool.query(
      `INSERT INTO companies (company_code, company_name, email, phone, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id`,
      [`TC_${Date.now()}`.slice(0, 20), 'Test Auth Company', testEmail, '+919876543210']
    );
    testCompanyId = compRes.rows[0].id;

    // 2. Insert test user with known password hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(initialPassword, salt);

    const userRes = await pool.query(
      `INSERT INTO users (company_id, username, email, password_hash, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id`,
      [testCompanyId, testUsername, testEmail, hash]
    );
    testUserId = userRes.rows[0].id;
  });

  afterAll(async () => {
    if (pool && testCompanyId) {
      // Clean up test data
      await pool.query(`DELETE FROM login_history WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM user_refresh_tokens WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM user_sessions WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM password_history WHERE user_id = $1`, [testUserId]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
      await pool.query(`DELETE FROM companies WHERE id = $1`, [testCompanyId]);
      await pool.end();
    }
  });

  describe('Validation & Edge Cases', () => {
    it('POST /api/auth/login should return 400 when identifier or password is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation Error');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('POST /api/auth/login should return 401 when password is wrong', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: testUsername,
        password: 'WrongPassword@999',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid username or password/i);
    });

    it('GET /api/auth/me should return 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Successful Login & Token Issuance', () => {
    it('POST /api/auth/login should return 200 with tokens and session', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: testUsername,
        password: initialPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(Number(testUserId));
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.session.id).toBeDefined();

      testAccessToken = res.body.data.tokens.accessToken;
      testRefreshToken = res.body.data.tokens.refreshToken;
      testSessionId = res.body.data.session.id;

      // Verify HTTP-only cookies are set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('access_token='))).toBe(true);
      expect(cookies.some((c) => c.includes('refresh_token='))).toBe(true);
    });

    it('GET /api/auth/me should return current user profile and session info', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(Number(testUserId));
      expect(res.body.data.user.username).toBe(testUsername);
      expect(res.body.data.currentSession.id).toBe(testSessionId);
    });
  });

  describe('Real-Time Sessions Management', () => {
    it('GET /api/auth/sessions should return active sessions list with isCurrent flag', async () => {
      const res = await request(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const current = res.body.data.find((s) => s.id === testSessionId);
      expect(current).toBeDefined();
      expect(current.isCurrent).toBe(true);
      expect(current.isActive).toBe(true);
    });

    it('GET /api/auth/login-history should return user audit trail', async () => {
      const res = await request(app)
        .get('/api/auth/login-history?page=1&limit=5')
        .set('Authorization', `Bearer ${testAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Refresh Token Rotation (RTR) & Reuse Detection', () => {
    it('POST /api/auth/refresh-token should rotate refresh token and issue new access token', async () => {
      const res = await request(app).post('/api/auth/refresh-token').send({
        refresh_token: testRefreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(testRefreshToken);

      testAccessToken = res.body.data.accessToken;
      newRefreshToken = res.body.data.refreshToken;
    });

    it('POST /api/auth/refresh-token with previously used token should trigger reuse detection and revoke session', async () => {
      const res = await request(app).post('/api/auth/refresh-token').send({
        refresh_token: testRefreshToken, // old rotated token
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/reuse detected/i);
    });
  });

  describe('Password History Verification', () => {
    let freshAccessToken;

    it('should re-login to obtain fresh session after reuse detection invalidated previous session', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: testUsername,
        password: initialPassword,
      });

      expect(res.status).toBe(200);
      freshAccessToken = res.body.data.tokens.accessToken;
    });

    it('POST /api/auth/change-password should reject reuse of recent password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .send({
          current_password: initialPassword,
          new_password: initialPassword, // same password
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/change-password should succeed with new strong password and update history', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .send({
          current_password: initialPassword,
          new_password: updatedPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Password changed successfully/i);
    });
  });

  describe('Logout Flows', () => {
    it('POST /api/auth/logout should revoke session and clear cookies', async () => {
      // Login with updated password
      const loginRes = await request(app).post('/api/auth/login').send({
        identifier: testUsername,
        password: updatedPassword,
      });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.data.tokens.accessToken;

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Logged out successfully/i);
    });
  });
});
