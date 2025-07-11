// src/config/env.ts

import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, str, num, url, bool } from 'envalid';

// Load .env file only in non-production environments
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: envPath });
}

// Validate environment variables
export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  isProduction: bool({ default: process.env.NODE_ENV === 'production' }),

  PORT: num({ default: 5000 }),
  MONGO_URI: str(),
  SETUP_KEY: str(),

  JWT_SECRET: str(),
  JWT_EXPIRATION: str({ default: '2h' }),
  REFRESH_TOKEN_SECRET: str(),
  REFRESH_TOKEN_EXPIRATION: str({ default: '7d' }),
  REFRESH_TOKEN_EXPIRATION_MS: num({ default: 604800000 }),

  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),

  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_CALLBACK_URL: url(),

  GITHUB_CLIENT_ID: str(),
  GITHUB_CLIENT_SECRET: str(),
  GITHUB_CALLBACK_URL: url(),

  RECAPTCHA_SECRET: str(),
  RECAPTCHA_SITE_KEY: str({ default: '' }),
  RECAPTCHA_MIN_SCORE: num({ default: 0.5 }),

  CLIENT_URL: url(),

  SMTP_HOST: str(),
  SMTP_PORT: num(),
  SMTP_SECURE: bool(),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  SMTP_TO: str(),
});

// Prevent localhost URLs in production
if (env.isProduction) {
  const invalidUrls = [env.CLIENT_URL, env.GOOGLE_CALLBACK_URL, env.GITHUB_CALLBACK_URL].filter(
    (u) => u.includes('localhost')
  );
  if (invalidUrls.length) {
    throw new Error(
      `❌ ERROR: The following URLs must not point to localhost in production:\n${invalidUrls.join(
        '\n'
      )}`
    );
  }
}
