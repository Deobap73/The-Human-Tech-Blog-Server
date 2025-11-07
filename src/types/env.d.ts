// /src/types/env.d.ts
/* eslint-disable @typescript-eslint/naming-convention */

declare namespace NodeJS {
  interface ProcessEnv {
    // Basic
    PORT: string;
    MONGO_URI: string;
    SETUP_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';

    // JWT & Auth
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRATION: string;
    REFRESH_TOKEN_EXPIRATION_MS: string;
    isProduction: boolean;

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: string;
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

    // SMTP Email (existing)
    SMTP_HOST: string;
    SMTP_PORT: string; // keep as string to match env loader
    SMTP_SECURE: string; // "true" | "false"
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_TO: string;

    // Mail provider switch + Resend (new)
    EMAIL_PROVIDER?: 'resend' | 'smtp' | string;
    RESEND_API_KEY?: string;
    MAIL_FROM?: string;
    MAIL_DEFAULT_TO?: string;

    // SEO / Misc (já existiam no .env.example)
    BASE_URL?: string;
    FIGMA_TOKEN?: string;
    GITHUB_TOKEN?: string;
    ADMIN_SYNC_KEY?: string;
  }
}

export {};
