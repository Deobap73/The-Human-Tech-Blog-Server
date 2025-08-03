// File: src/app.ts

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import './config/passport';
import { env } from './config/env';
import i18next from './i18n';
import i18nextMiddleware from 'i18next-http-middleware';

import { setupSecurityMiddleware } from './middleware/securityMiddleware';
import { csrfWithLogging } from './middleware/csrfMiddleware';

// Import route modules
import csrfRouter from './routes/csrf';
import setupRoutes from './routes/setupRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import contactRoutes from './routes/contact';
import postRoutes from './routes/postRoutes';
import aiPromptRoutes from './routes/aiPromptRoutes';
import commentRoutes from './routes/commentRoutes';
import reactionRoutes from './routes/reactionRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import twofaRoutes from './routes/twofaRoutes';
import conversationRoutes from './routes/conversationRoutes';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminSettingsRoutes from './routes/adminSettingsRoutes';
import userAdminRoutes from './routes/userAdminRoutes';
import draftRoutes from './routes/draftRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import userRoutes from './routes/userRoutes';
import tagRoutes from './routes/tagRoutes';
import commentModerationRoutes from './routes/commentModerationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import sponsorRoutes from './routes/sponsor.routes';
import sitemapRoute from './routes/sitemapRoute';
import compression from 'compression';

const app = express();

// Serve static files (includes robots.txt)
app.use(express.static(path.join(process.cwd(), 'public')));

app.set('trust proxy', 1); // Trust first proxy for correct client IP

// =========================
// Security Middlewares
// =========================
setupSecurityMiddleware(app);

// =========================
// Base Middlewares
// =========================
app.use(cookieParser());

// CORS must come before body parsers
const allowedOrigins = [
  env.CLIENT_URL, // e.g. https://thehumantechblog.com
  process.env.RAILWAY_FRONTEND_URL,
  process.env.RAILWAY_BACKEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        console.warn(`Blocked by CORS: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      }
      return callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'XSRF-TOKEN'],
    exposedHeaders: ['Set-Cookie', 'XSRF-TOKEN'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize i18n after body parsing
app.use(i18nextMiddleware.handle(i18next));

// =========================
// CSRF Protection
// =========================

// 1. Endpoint to generate CSRF token and set cookies:
//    - HTTP-only "_csrfSecret" cookie (handled by csrf middleware)
//    - Non-HTTP-only "XSRF-TOKEN" cookie for double-submit
app.get('/api/auth/csrf', csrfWithLogging, (req, res) => {
  const token = req.csrfToken();

  // LOG 1: Antes de setar cookies
  console.log('[CSRF][DEBUG][INICIO] Gerando token CSRF:', token);
  console.log('[CSRF][DEBUG] NODE_ENV:', env.NODE_ENV);
  console.log('[CSRF][DEBUG] Request headers:', req.headers);
  console.log('[CSRF][DEBUG] Cookies recebidas:', req.cookies);

  // (Opcional) Mostra os cookies atuais antes de definir novos
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: env.NODE_ENV === 'production' ? '.thehumantechblog.com' : undefined,
    path: '/',
  });

  // LOG 2: Depois de setar cookies
  console.log('[CSRF][DEBUG][Set-Cookie] XSRF-TOKEN cookie definida:', {
    httpOnly: false,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: env.NODE_ENV === 'production' ? '.thehumantechblog.com' : undefined,
    path: '/',
    valor: token,
  });

  // Tenta também forçar manualmente o cookie _csrfSecret só para debugging (opcional)
  if (req.cookies._csrfSecret) {
    res.cookie('_csrfSecret', req.cookies._csrfSecret, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: env.NODE_ENV === 'production' ? '.thehumantechblog.com' : undefined,
      path: '/',
    });
    console.log('[CSRF][DEBUG][Set-Cookie] _csrfSecret cookie RE-SETADA (debug)');
  }

  // LOG 3: Just before response
  console.log('[CSRF][DEBUG][RESPONSE] Vai devolver JSON:', { csrfToken: token });

  res.status(200).json({ csrfToken: token });
});

// 2. Apply CSRF protection to all mutating requests except health, refresh, OPTIONS
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path === '/health') return next();
  if (req.method === 'POST' && req.path === '/api/auth/refresh') return next();
  if (req.method === 'OPTIONS') return next();
  return csrfWithLogging(req, res, next);
});

// =========================
// Passport Initialization
// =========================
app.use(passport.initialize());

// =========================
// Route Mounting
// =========================
app.use('/api', csrfRouter);
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai-prompts', aiPromptRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/moderation/comments', commentModerationRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/2fa', twofaRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/users', userAdminRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/', sitemapRoute);

// =========================
// Generate the already compressed sitemap for advanced SEO
// =========================

app.use(compression());

// =========================
// Health Check & Root
// =========================
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/', (_, res) => {
  res.send(`
    <h1>The Human Tech Blog API</h1>
    <p>Server is running...</p>
    <a href="/health">Check health status</a>
  `);
});

// =========================
// Global Error Handler
// =========================
interface HttpError extends Error {
  status?: number;
  stack?: string;
}

app.use(
  (err: HttpError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('🚨 Global Error Handler:', {
      path: req.path,
      method: req.method,
      body: req.body,
      error: err.stack || err.message,
      name: err.name,
      full: err,
    });
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message,
      stack: err.stack,
      name: err.name,
      error: err,
    });
  }
);

export default app;
