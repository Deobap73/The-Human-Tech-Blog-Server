import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import redisClient from '../config/redis';
import { Response } from 'express';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

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

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    maxAge: env.REFRESH_TOKEN_EXPIRATION_MS,
    path: '/', // Garante disponibilidade para todas as rotas
  });

  await redisClient.setEx(
    `refresh:${userId}`,
    Math.floor(env.REFRESH_TOKEN_EXPIRATION_MS / 1000),
    refreshToken
  );

  return { accessToken, refreshToken };
};
