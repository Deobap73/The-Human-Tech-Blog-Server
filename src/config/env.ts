'use strict';

import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, str, num, url, bool } from 'envalid';

/**
 * Load .env files depending on NODE_ENV:
 * - production: assume variables come from the host (no file load)
 * - test: load .env.test
 * - development (default): load .env
 */
const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV !== 'production') {
  const envPath =
    NODE_ENV === 'test'
      ? path.resolve(__dirname, '../../.env.test')
      : path.resolve(__dirname, '../../.env');
  dotenv.config({ path: envPath });
}

/**
 * Validate environment variables (strict and typed).
 * Notes:
 * - FIGMA_TOKEN/GITHUB_TOKEN can be empty in dev; sync endpoints will handle missing tokens gracefully.
 * - ADMIN_SYNC_KEY is required (protects sync routes). Provide a non-empty value even in dev/test.
 * - BASE_URL is used in sitemap generation and must be a valid absolute URL.
 */
export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  isProduction: bool({ default: NODE_ENV === 'production' }),

  // App
  PORT: num({ default: 5000 }),
  MONGO_URI: str(),
  SETUP_KEY: str(),

  // JWT
  JWT_SECRET: str(),
  JWT_EXPIRATION: str({ default: '2h' }),
  REFRESH_TOKEN_SECRET: str(),
  REFRESH_TOKEN_EXPIRATION: str({ default: '7d' }),
  REFRESH_TOKEN_EXPIRATION_MS: num({ default: 604800000 }),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),

  // OAuth Google
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_CALLBACK_URL: url(),

  // OAuth GitHub
  GITHUB_CLIENT_ID: str(),
  GITHUB_CLIENT_SECRET: str(),
  GITHUB_CALLBACK_URL: url(),

  // reCAPTCHA
  RECAPTCHA_SECRET: str(),
  // Backend normalmente não precisa do SITE_KEY, mas deixamos opcional para debug/tools
  RECAPTCHA_SITE_KEY: str({ default: '' }),
  // 🔥 NEW: Score mínimo para v3 (0.0–1.0). 0.5 é um bom ponto de partida.
  RECAPTCHA_MIN_SCORE: num({ default: 0.5 }),

  // Frontend URL
  CLIENT_URL: url(),

  // SMTP
  SMTP_HOST: str(),
  SMTP_PORT: num(),
  SMTP_SECURE: bool(),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  SMTP_TO: str(),

  // 🔥 NEW: Base URL for sitemaps and canonical links
  BASE_URL: url({ default: 'https://thehumantechblog.com' }),

  // 🔥 NEW: Tokens for semi-automatic sync (optional in dev)
  FIGMA_TOKEN: str({ default: '' }),
  GITHUB_TOKEN: str({ default: '' }),

  // 🔥 NEW: Admin key to protect sync routes
  ADMIN_SYNC_KEY: str(),

  // === AI (OpenAI) ===
  // 🔥 NEW: OpenAI API for ATS generation
  OPENAI_API_KEY: str({ default: '' }),
  OPENAI_MODEL: str({ default: 'gpt-4o-mini' }),

  // === PayPal ===
  // 🔥 NEW: PayPal client credentials and API base (sandbox by default)
  PAYPAL_CLIENT_ID: str({ default: '' }),
  PAYPAL_SECRET: str({ default: '' }),
  PAYPAL_API_BASE: url({ default: 'https://api-m.sandbox.paypal.com' }),

  // === ATS Product ===
  // 🔥 NEW: Single-price product in EUR (server-enforced)
  ATS_PRICE_EUR: num({ default: 0.5 }),
});

/**
 * Production safety: disallow localhost callback/clients in production.
 */
if (env.isProduction) {
  const invalidUrls = [env.CLIENT_URL, env.GOOGLE_CALLBACK_URL, env.GITHUB_CALLBACK_URL].filter(
    (u) => u.includes('localhost')
  );
  if (invalidUrls.length) {
    throw new Error(
      `❌ ERROR: The following URLs must not point to localhost in production:\n${invalidUrls.join('\n')}`
    );
  }
}
