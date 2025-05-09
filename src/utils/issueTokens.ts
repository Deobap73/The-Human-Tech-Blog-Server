// src/utils/issueTokens.ts
import { Response } from 'express';
import { signAccessToken, signRefreshToken } from './jwt';
import redisClient from '../config/redis';
import { env } from '../config/env';

export const issueTokens = async (userId: string, res: Response) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await redisClient.set(refreshToken, userId, { EX: env.REFRESH_TOKEN_EXPIRATION_MS / 1000 });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    maxAge: env.REFRESH_TOKEN_EXPIRATION_MS,
  });

  return { accessToken };
};
