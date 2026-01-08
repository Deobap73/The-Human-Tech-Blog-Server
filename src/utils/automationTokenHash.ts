// /src/utils/automationTokenHash.ts

'use strict';

import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Hash a plaintext automation token using a server side pepper.
 * We never store the plaintext token in the database.
 */
export function hashAutomationToken(token: string): string {
  const raw = (token || '').trim();
  const pepper = env.AUTOMATION_TOKEN_PEPPER;

  return crypto.createHash('sha256').update(`${raw}:${pepper}`).digest('hex');
}

/**
 * Generate a new plaintext automation token.
 * Prefix helps us distinguish from JWT in Authorization header.
 */
export function generateAutomationToken(): string {
  const random = crypto.randomBytes(32).toString('hex');
  return `at_${random}`;
}
