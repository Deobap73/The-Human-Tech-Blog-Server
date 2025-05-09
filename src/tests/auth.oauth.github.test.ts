// src/tests/auth.oauth.github.test.ts

import request from 'supertest';
import app from '../app';

describe('GitHub OAuth Login Flow', () => {
  it('should handle GitHub OAuth callback and set refreshToken', async () => {
    const res = await request(app).get('/api/auth/github/callback');

    expect(res.status).toBe(302);

    // Handle both string and array cases for set-cookie header
    const cookies = Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie']
      : [res.headers['set-cookie']];

    // More robust cookie check
    const hasRefreshToken = cookies.some((cookie: string | undefined) =>
      cookie?.includes('refreshToken=mock-github-token')
    );

    expect(hasRefreshToken).toBe(true);
  });
});
