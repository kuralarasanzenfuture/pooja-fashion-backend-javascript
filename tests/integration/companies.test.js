import request from 'supertest';
import app from '../../src/app.js';

describe('Companies API Endpoints', () => {
  it('GET /api/companies/invalid-id should return 400 for non-numeric ID', async () => {
    const res = await request(app).get('/api/companies/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/companies with empty body should fail validation with 400', async () => {
    const res = await request(app).post('/api/companies').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST /api/companies with invalid company code should fail validation', async () => {
    const res = await request(app).post('/api/companies').send({
      company_code: 'A', // too short
      company_name: 'Test Company',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });
});
