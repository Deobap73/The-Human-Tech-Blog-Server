// src/tests/auth.oauth.google.test.ts
import request from 'supertest';
import app from '../app';
import { getCookieByName } from './helpers/cookie';

describe('Google OAuth Login Flow', () => {
  it('should handle Google OAuth callback and set refreshToken', async () => {
    const res = await request(app).get('/api/auth/google/callback');

    expect(res.status).toBe(302);

    const cookies = Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie']
      : [res.headers['set-cookie'] ?? ''];

    const token = getCookieByName(cookies, 'refreshToken');
    expect(token).toBe('mock-google-token');
  });
});
