// src/services/token.service.ts
import redisClient from '../config/redis';
import { verifyRefreshToken } from '../utils/jwt';

const REFRESH_TOKEN_PREFIX = 'refresh:';

/**
 * Armazena um refresh token no Redis para um usuário específico.
 * @param userId O ID do usuário.
 * @param token O refresh token a ser armazenado.
 * @param ttlMs O tempo de vida do token em milissegundos.
 */
export const storeRefreshToken = async (userId: string, token: string, ttlMs: number) => {
  // Converte ttlMs para segundos, pois redisClient.setEx espera TTL em segundos.
  await redisClient.setEx(`${REFRESH_TOKEN_PREFIX}${userId}`, ttlMs / 1000, token);
};

/**
 * Revoga (deleta) o refresh token armazenado para um usuário específico no Redis.
 * @param userId O ID do usuário cujo refresh token será revogado.
 */
export const revokeRefreshToken = async (userId: string) => {
  await redisClient.del(`${REFRESH_TOKEN_PREFIX}${userId}`);
};

/**
 * Valida um refresh token verificando sua assinatura e se ele corresponde ao
 * token armazenado no Redis para o usuário correspondente.
 * @param token O refresh token a ser validado.
 * @returns O ID do usuário se o token for válido e corresponder ao armazenado, caso contrário, null.
 */
export const validateStoredRefreshToken = async (token: string): Promise<string | null> => {
  try {
    // CORREÇÃO: Desestruturar 'id' em vez de 'userId'
    // A função verifyRefreshToken retorna { id: string }, não { userId: string }.
    const { id } = verifyRefreshToken(token);
    const stored = await redisClient.get(`${REFRESH_TOKEN_PREFIX}${id}`); // Usar 'id' para a chave Redis

    if (!stored || stored !== token) {
      console.warn(
        `[validateStoredRefreshToken] Stored token for user ID ${id} does not match provided token or is missing.`
      );
      return null;
    }

    console.log(`[validateStoredRefreshToken] Token valid for user ID: ${id}`);
    return id;
  } catch (error) {
    console.error(
      `[validateStoredRefreshToken] Refresh token validation failed: ${(error as Error).message}`
    );
    return null;
  }
};
