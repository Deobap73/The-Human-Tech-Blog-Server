// The-Human-Tech-Blog-Server\src\config\env.ts

import { cleanEnv, str, num, url, bool } from 'envalid';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Verify .env exists
const envPath = path.resolve(__dirname, '../../.env');
console.log('.env exists:', fs.existsSync(envPath));

// 2. Load with debug
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Dotenv load error:', result.error);
} else {
  console.log('Loaded variables:', Object.keys(result.parsed || {}));
}

// 3. Directly check process.env
console.log('In process.env:', {
  JWT_SECRET: !!process.env.JWT_SECRET,
  SETUP_KEY: !!process.env.SETUP_KEY,
});

export const env = cleanEnv(process.env, {
  isProduction: bool({ default: process.env.NODE_ENV === 'production' }),

  // Configurações básicas
  PORT: num({ default: 5000 }),
  MONGO_URI: str({ default: 'mongodb://localhost:27017/thehumantechblog' }),
  SETUP_KEY: str(),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),

  // JWT e Autenticação
  JWT_SECRET: str(),
  JWT_EXPIRATION: str({ default: '15m' }),
  REFRESH_TOKEN_SECRET: str(),
  REFRESH_TOKEN_EXPIRATION: str({ default: '7d' }),
  REFRESH_TOKEN_EXPIRATION_MS: num({ default: 604800000 }), // 7 days in ms

  // Redis
  /* REDIS_URL: str({ default: 'redis://localhost:6379' }), */

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: str({ default: '' }),
  CLOUDINARY_API_KEY: str({ default: '' }),
  CLOUDINARY_API_SECRET: str({ default: '' }),

  // OAuth - Google
  GOOGLE_CLIENT_ID: str({ default: '' }),
  GOOGLE_CLIENT_SECRET: str({ default: '' }),
  GOOGLE_CALLBACK_URL: url({ default: 'http://localhost:5000/api/auth/google/callback' }),

  // Google reCAPTCHA
  RECAPTCHA_SECRET: str(),

  // OAuth - GitHub
  GITHUB_CLIENT_ID: str({ default: '' }),
  GITHUB_CLIENT_SECRET: str({ default: '' }),
  GITHUB_CALLBACK_URL: url({ default: 'http://localhost:5000/api/auth/github/callback' }),

  // Frontend
  CLIENT_URL: url({ default: 'http://localhost:5173' }),

  // Email SMTP (Hostinger)
  SMTP_HOST: str({ default: '' }),
  SMTP_PORT: num({ default: 465 }),
  SMTP_SECURE: bool({ default: true }),
  SMTP_USER: str({ default: '' }),
  SMTP_PASS: str({ default: '' }),
  SMTP_TO: str({ default: '' }),
});
