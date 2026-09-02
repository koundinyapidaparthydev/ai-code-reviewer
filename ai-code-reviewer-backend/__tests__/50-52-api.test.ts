import request from 'supertest';
import app from '../src/app';

describe('50–52. API login, auth, health', () => {
  it('50. seed user can log in', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@local', password: 'demo-password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('demo@local');
  });

  it('51. unauthenticated validations 401', async () => {
    const res = await request(app).get('/api/validations');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('52. health shape', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toEqual(
      expect.objectContaining({
        ok: expect.any(Boolean),
        redis: expect.any(Boolean),
        db: expect.any(Boolean),
        reviewMode: expect.any(String),
      })
    );
  });
});
