// src/services/token.service.ts
import { verifyRefreshToken } from '../utils/jwt';

/**
 * Validates a refresh token by verifying its signature and expiry.
 * Stateless: does not check Redis or DB.
 * @param token The refresh token to validate.
 * @returns The user ID if valid, null otherwise.
 */
export const validateStoredRefreshToken = async (token: string): Promise<string | null> => {
  try {
    const { id } = verifyRefreshToken(token);
    return id;
  } catch (error) {
    return null;
  }
};
