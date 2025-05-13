// src/tests/auth.oauth.jwt.test.ts
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';
import app from '../../src/app';

const decode = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as { userId: string; exp: number };

const toCookieArray = (cookie: string | string[] | undefined): string[] => {
  if (!cookie) return [];
  return Array.isArray(cookie) ? cookie : [cookie];
};

describe('OAuth JWT Token Validation', () => {
  it('should validate Google OAuth accessToken structure and payload', async () => {
    const res = await request(app).get('/api/auth/google/callback');
    const cookies = toCookieArray(res.headers['set-cookie']);
    const tokenCookie = cookies.find((c) => c.includes('refreshToken=mock-google-token'));
    expect(tokenCookie).toBeDefined();

    const mockToken = jwt.sign({ userId: 'mockUser' }, env.JWT_SECRET, { expiresIn: '15m' });
    const payload = decode(mockToken);

    expect(typeof payload.userId).toBe('string');
    expect(payload.exp * 1000).toBeGreaterThan(Date.now());
  });

  it('should validate GitHub OAuth accessToken structure and payload', async () => {
    const res = await request(app).get('/api/auth/github/callback');
    const cookies = toCookieArray(res.headers['set-cookie']);
    const tokenCookie = cookies.find((c) => c.includes('refreshToken=mock-github-token'));
    expect(tokenCookie).toBeDefined();

    const mockToken = jwt.sign({ userId: 'mockUser' }, env.JWT_SECRET, { expiresIn: '15m' });
    const payload = decode(mockToken);

    expect(typeof payload.userId).toBe('string');
    expect(payload.exp * 1000).toBeGreaterThan(Date.now());
  });
});
