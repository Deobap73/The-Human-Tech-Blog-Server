// src/services/token.service.ts
import redisClient from '../config/redis';
import { verifyRefreshToken } from '../utils/jwt';

const REFRESH_TOKEN_PREFIX = 'refresh:';

export const storeRefreshToken = async (userId: string, token: string, ttlMs: number) => {
  await redisClient.setEx(`${REFRESH_TOKEN_PREFIX}${userId}`, ttlMs / 1000, token);
};

export const revokeRefreshToken = async (userId: string) => {
  await redisClient.del(`${REFRESH_TOKEN_PREFIX}${userId}`);
};

export const validateStoredRefreshToken = async (token: string): Promise<string | null> => {
  try {
    const { userId } = verifyRefreshToken(token);
    const stored = await redisClient.get(`${REFRESH_TOKEN_PREFIX}${userId}`);
    if (!stored || stored !== token) return null;
    return userId;
  } catch {
    return null;
  }
};
