// The-Human-Tech-Blog-Server\src\config\env.ts

import { cleanEnv, str, num, url, bool } from 'envalid';

export const env = cleanEnv(process.env, {
  PORT: num({ default: 5000 }),
  JWT_SECRET: str(),
  MONGO_URI: str({ default: 'mongodb://localhost:27017/thehumantechblog' }),
  SETUP_KEY: str(),

  // Opcionais
  VITE_CLOUDINARY_CLOUD_NAME: str({ default: '' }),
  CLOUDINARY_API_KEY: str({ default: '' }),
  CLOUDINARY_API_SECRET: str({ default: '' }),

  GOOGLE_CLIENT_ID: str({ default: '' }),
  GOOGLE_CLIENT_SECRET: str({ default: '' }),
  GOOGLE_CALLBACK_URL: url({ default: 'http://localhost:5000' }),

  GITHUB_CLIENT_ID: str({ default: '' }),
  GITHUB_CLIENT_SECRET: str({ default: '' }),

  CLIENT_URL: url({ default: 'http://localhost:5173' }),
  REDIS_URL: str({ default: 'redis://localhost:6379' }),

  isProduction: bool({ default: false }),
});
