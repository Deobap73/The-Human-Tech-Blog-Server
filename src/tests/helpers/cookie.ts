// tests/helpers/cookie.ts

import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export function getCookieByName(cookies: string[], name: string): string | undefined {
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie?.split(';')[0].split('=')[1]; // Apenas o valor do cookie
}

export function hasCookieWithValue(
  rawCookies: string | string[] | undefined,
  expectedValuePart: string
): boolean {
  const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies ?? ''];
  return cookies.some((cookie) => cookie.includes(expectedValuePart));
}

// src/tests/helpers/cookies.ts
export function getCookies(headers: any): string[] {
  const cookies = headers['set-cookie'];
  return Array.isArray(cookies) ? cookies : [cookies].filter(Boolean);
}

export function issueTestToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '1h' });
}
