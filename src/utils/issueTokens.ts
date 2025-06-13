// src/utils/issueTokens.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Response } from 'express';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Issues JWT access and refresh tokens and sets the refresh token in a httpOnly cookie.
 * Stateless: Does not persist tokens in Redis or DB.
 */
export const issueTokens = async (userId: string, res: Response): Promise<Tokens> => {
  if (!env.JWT_SECRET || !env.REFRESH_TOKEN_SECRET) {
    throw new Error('JWT secrets are not configured');
  }
  const accessToken = jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ id: userId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRATION as jwt.SignOptions['expiresIn'],
  });

  // Store only in cookie, not in Redis!
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: env.REFRESH_TOKEN_EXPIRATION_MS,
    path: '/',
  });

  return { accessToken, refreshToken };
};
