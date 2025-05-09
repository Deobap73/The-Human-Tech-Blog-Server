// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    // Configurações básicas
    PORT: string;
    MONGO_URI: string;
    SETUP_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';

    // JWT e Autenticação
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRATION: string;
    REFRESH_TOKEN_EXPIRATION_MS: string;

    // Redis
    REDIS_URL: string;

    // Cloudinary
    VITE_CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;

    // OAuth - Google
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;

    // OAuth - GitHub
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GITHUB_CALLBACK_URL: string;

    // Frontend
    CLIENT_URL: string;

    // Google reCAPTCHA
    RECAPTCHA_SECRET: string;
  }
}
