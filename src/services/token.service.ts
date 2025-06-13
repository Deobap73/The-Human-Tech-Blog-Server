// src/services/token.service.ts
import { verifyRefreshToken } from '../utils/jwt';
import TokenBlacklist from '../models/TokenBlacklist';

/**
 * Validates a refresh token by verifying its signature, expiry,
 * and if it is not blacklisted in MongoDB.
 * @param token The refresh token to validate.
 * @returns The user ID if valid and not blacklisted, null otherwise.
 */
export const validateStoredRefreshToken = async (token: string): Promise<string | null> => {
  try {
    // Verifica se está na blacklist
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return null;
    }
    const { id } = verifyRefreshToken(token);
    return id;
  } catch {
    return null;
  }
};
