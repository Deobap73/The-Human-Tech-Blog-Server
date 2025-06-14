// /src/config/env.ts

import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, str, num, url, bool } from 'envalid';

// 1. Resolve .env path para 1 nível acima de /src
const envPath = path.resolve(__dirname, '../../.env');

// 2. Carrega variáveis do .env file (apenas local/dev)
dotenv.config({ path: envPath });

// 3. Valida e limpa variáveis de ambiente
export const env = cleanEnv(process.env, {
  // Ambiente
  isProduction: bool({ default: process.env.NODE_ENV === 'production' }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),

  // Básico
  PORT: num({ default: 5000 }),
  MONGO_URI: str({ default: 'mongodb://localhost:27017/thehumantechblog' }),
  SETUP_KEY: str(),

  // JWT e Autenticação
  JWT_SECRET: str(),
  JWT_EXPIRATION: str({ default: '15m' }),
  REFRESH_TOKEN_SECRET: str(),
  REFRESH_TOKEN_EXPIRATION: str({ default: '7d' }),
  REFRESH_TOKEN_EXPIRATION_MS: num({ default: 604800000 }), // 7 days in ms

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: str({ default: '' }),
  CLOUDINARY_API_KEY: str({ default: '' }),
  CLOUDINARY_API_SECRET: str({ default: '' }),

  // OAuth - Google
  GOOGLE_CLIENT_ID: str({ default: '' }),
  GOOGLE_CLIENT_SECRET: str({ default: '' }),
  GOOGLE_CALLBACK_URL: url({ default: 'http://localhost:5000/api/auth/google/callback' }),

  // OAuth - GitHub
  GITHUB_CLIENT_ID: str({ default: '' }),
  GITHUB_CLIENT_SECRET: str({ default: '' }),
  GITHUB_CALLBACK_URL: url({ default: 'http://localhost:5000/api/auth/github/callback' }),

  // Google reCAPTCHA
  RECAPTCHA_SECRET: str(),

  // Frontend
  CLIENT_URL: url({ default: 'http://localhost:5173' }),

  // SMTP Email
  SMTP_HOST: str({ default: '' }),
  SMTP_PORT: num({ default: 465 }),
  SMTP_SECURE: bool({ default: true }),
  SMTP_USER: str({ default: '' }),
  SMTP_PASS: str({ default: '' }),
  SMTP_TO: str({ default: '' }),
});

// 4. Bloqueio de produção com URLs localhost em OAuth/callbacks!
if (env.NODE_ENV === 'production') {
  const localhostUrls = [env.CLIENT_URL, env.GOOGLE_CALLBACK_URL, env.GITHUB_CALLBACK_URL].filter(
    (urlVal) => urlVal.includes('localhost')
  );
  if (localhostUrls.length > 0) {
    throw new Error(
      `❌ ERROR: OAUTH/CLIENT_URL points to localhost in production!\nCorrija em Render/Railway:\n${localhostUrls.join(
        '\n'
      )}`
    );
  }
}
