// The-Human-Tech-Blog-Server\src\config\env.ts

import { cleanEnv, str, num, url, bool } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

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
  REDIS_URL: str({ default: 'redis://localhost:6379' }),

  // Cloudinary
  VITE_CLOUDINARY_CLOUD_NAME: str({ default: '' }),
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
});
