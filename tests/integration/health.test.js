import request from 'supertest';
import app from '../../src/app.js';

describe('Health Check API', () => {
  it('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('OK');
  });

  it('GET /api/health should return 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /non-existent-route should return 404', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Route not found');
  });

  it('GET /api/docs/ should serve interactive Swagger documentation', async () => {
    const res = await request(app).get('/api/docs/');
    expect([200, 301]).toContain(res.status);
  });
});
