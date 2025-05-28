// The-Human-Tech-Blog-Server/src/utils/issueTokens.ts

import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import redisClient from '../config/redis';
import { Response } from 'express';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const issueTokens = async (userId: string, res: Response): Promise<Tokens> => {
  console.log(`[issueTokens] Attempting to issue tokens for user: ${userId}`); // Added debug log
  if (!env.JWT_SECRET || !env.REFRESH_TOKEN_SECRET) {
    console.error('[issueTokens] JWT secrets are not configured.'); // Added debug log
    throw new Error('JWT secrets are not configured');
  }

  const accessToken = jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION as jwt.SignOptions['expiresIn'],
  });
  console.log(`[issueTokens] Access token generated, expires in: ${env.JWT_EXPIRATION}`); // Added debug log

  const refreshToken = jwt.sign({ id: userId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRATION as jwt.SignOptions['expiresIn'],
  });
  console.log(`[issueTokens] Refresh token generated, expires in: ${env.REFRESH_TOKEN_EXPIRATION}`); // Added debug log

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax', // <--- PATCH CRÍTICO
    maxAge: env.REFRESH_TOKEN_EXPIRATION_MS,
    path: '/',
    // Não uses domain!
  });
  console.log('[issueTokens] Cookie flags:', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: env.REFRESH_TOKEN_EXPIRATION_MS,
    path: '/',
  });

  await redisClient.setEx(
    `refresh:${userId}`,
    Math.floor(env.REFRESH_TOKEN_EXPIRATION_MS / 1000),
    refreshToken
  );
  console.log(`[issueTokens] Refresh token stored in Redis for user: ${userId}`); // Added debug log

  return { accessToken, refreshToken };
};
