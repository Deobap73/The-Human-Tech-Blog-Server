// ./src/config/env.ts

'use strict';

import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, str, num, url, bool } from 'envalid';

/**
 * Load env files depending on NODE_ENV:
 * production uses host variables
 * test loads .env.test
 * development loads .env
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

  // Automation tokens
  AUTOMATION_TOKEN_PEPPER: str(),

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
  RECAPTCHA_SITE_KEY: str({ default: '' }),
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

  // Base URL
  BASE_URL: url({ default: 'https://thehumantechblog.com' }),

  // Tokens for semi automatic sync
  FIGMA_TOKEN: str({ default: '' }),
  GITHUB_TOKEN: str({ default: '' }),

  // Admin key to protect sync routes
  ADMIN_SYNC_KEY: str(),

  // AI OpenAI
  OPENAI_API_KEY: str({ default: '' }),
  OPENAI_MODEL: str({ default: 'gpt-4o-mini' }),

  // PayPal
  PAYPAL_CLIENT_ID: str({ default: '' }),
  PAYPAL_SECRET: str({ default: '' }),
  PAYPAL_API_BASE: url({ default: 'https://api-m.sandbox.paypal.com' }),

  // ATS Product
  ATS_PRICE_EUR: num({ default: 0.5 }),

  // Make published webhook
  MAKE_PUBLISHED_WEBHOOK_URL: str({ default: '' }),
  MAKE_PUBLISHED_WEBHOOK_SECRET: str({ default: '' }),
});

/**
 * Production safety: disallow localhost callback clients in production.
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
