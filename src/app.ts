// src/app.ts

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('[app.ts] Environment variables loaded from .env file.'); // Added debug log

import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import passport from 'passport';
import './config/passport';
import { env } from './config/env';
import { i18nextMiddleware } from './i18n';

// Import routes (all as modules)
import setupRoutes from './routes/setupRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import postRoutes from './routes/postRoutes';
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

const app = express();
console.log('[app.ts] Express app initialized.'); // Added debug log

// Debug/inline routes
app.get('/api/notifications-debug', (_req, res) => {
  console.log('[app.ts] GET /api/notifications-debug endpoint hit.'); // Added debug log
  res.json({ ok: true, msg: 'Notificações debug OK!' });
});
app.get('/api/notifications-inline-test', (_req, res) => {
  console.log('[app.ts] GET /api/notifications-inline-test endpoint hit.'); // Added debug log
  res.json({ ok: true, msg: 'Notificações INLINE OK!' });
});

// Middlewares base
app.use(cookieParser());
console.log('[app.ts] cookieParser middleware applied.'); // Added debug log
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
console.log('[app.ts] CORS middleware applied with origin: http://localhost:5173.'); // Added debug log
app.use(express.json());
console.log('[app.ts] express.json middleware applied.'); // Added debug log
app.use(express.urlencoded({ extended: true }));
console.log('[app.ts] express.urlencoded middleware applied.'); // Added debug log
app.use(i18nextMiddleware.handle(require('./i18n').default));
console.log('[app.ts] i18nextMiddleware applied.'); // Added debug log

// CSRF Protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: false,
    sameSite: 'lax',
    secure: env.isProduction,
  },
});
console.log(`[app.ts] CSRF protection configured. Production mode: ${env.isProduction}.`); // Added debug log
app.get('/api/auth/csrf', csrfProtection, (req, res) => {
  console.log('[app.ts] GET /api/auth/csrf route hit with CSRF protection.'); // Added debug log
  return res.status(200).json({ csrfToken: req.csrfToken() });
});
app.use('/api', (req, res, next) => {
  console.log(`[app.ts] Checking CSRF for API route: ${req.method} ${req.path}`); // Added debug log
  if (
    (req.method === 'POST' && req.path === '/auth/refresh') ||
    (req.method === 'GET' && req.path === '/auth/csrf') ||
    (req.method === 'GET' && req.path === '/health')
  ) {
    console.log(`[app.ts] CSRF protection bypassed for: ${req.method} ${req.path}`); // Added debug log
    return next();
  }
  console.log(`[app.ts] Applying CSRF protection for: ${req.method} ${req.path}`); // Added debug log
  return csrfProtection(req, res, next);
});
app.get('/api/auth/csrf', (req, res) => {
  console.log(
    '[app.ts] GET /api/auth/csrf route hit (second declaration, likely for token retrieval).'
  ); // Added debug log
  return res.status(200).json({ csrfToken: req.csrfToken() });
});
app.use(passport.initialize());
console.log('[app.ts] Passport middleware initialized.'); // Added debug log

// Rotas principais — **ordem importa!**
app.use('/api/notifications', notificationRoutes);
console.log('[app.ts] Mounted notificationRoutes at /api/notifications.'); // Added debug log
app.use('/api/categories', categoryRoutes);
console.log('[app.ts] Mounted categoryRoutes at /api/categories.'); // Added debug log
app.use('/api/comments', commentRoutes);
console.log('[app.ts] Mounted commentRoutes at /api/comments.'); // Added debug log
app.use('/api/moderation/comments', commentModerationRoutes);
console.log('[app.ts] Mounted commentModerationRoutes at /api/moderation/comments.'); // Added debug log
app.use('/api/reactions', reactionRoutes);
console.log('[app.ts] Mounted reactionRoutes at /api/reactions.'); // Added debug log
app.use('/api/bookmarks', bookmarkRoutes);
console.log('[app.ts] Mounted bookmarkRoutes at /api/bookmarks.'); // Added debug log
app.use('/api/2fa', twofaRoutes);
console.log('[app.ts] Mounted twofaRoutes at /api/2fa.'); // Added debug log
app.use('/api/conversations', conversationRoutes);
console.log('[app.ts] Mounted conversationRoutes at /api/conversations.'); // Added debug log
app.use('/api/messages', messageRoutes);
console.log('[app.ts] Mounted messageRoutes at /api/messages.'); // Added debug log
app.use('/api/admin/settings', adminSettingsRoutes);
console.log('[app.ts] Mounted adminSettingsRoutes at /api/admin/settings.'); // Added debug log
app.use('/api/admin/users', userAdminRoutes);
console.log('[app.ts] Mounted userAdminRoutes at /api/admin/users.'); // Added debug log
app.use('/api/drafts', draftRoutes);
console.log('[app.ts] Mounted draftRoutes at /api/drafts.'); // Added debug log
app.use('/api/newsletter', newsletterRoutes);
console.log('[app.ts] Mounted newsletterRoutes at /api/newsletter.'); // Added debug log
app.use('/api/users', userRoutes);
console.log('[app.ts] Mounted userRoutes at /api/users.'); // Added debug log
app.use('/api/tags', tagRoutes);
console.log('[app.ts] Mounted tagRoutes at /api/tags.'); // Added debug log
app.use('/api/analytics', analyticsRoutes);
console.log('[app.ts] Mounted analyticsRoutes at /api/analytics.'); // Added debug log

// Posts APENAS EM /api/posts (não monta em /api nem global)
app.use('/api/posts', postRoutes);
console.log('[app.ts] Mounted postRoutes at /api/posts.'); // Added debug log

app.use('/api/setup', setupRoutes);
console.log('[app.ts] Mounted setupRoutes at /api/setup.'); // Added debug log
app.use('/api/auth', authRoutes);
console.log('[app.ts] Mounted authRoutes at /api/auth.'); // Added debug log

// Health e página base
app.get('/health', (_, res) => {
  console.log('[app.ts] GET /health endpoint hit. Returning server status.'); // Added debug log
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/', (_, res) => {
  console.log('[app.ts] GET / (root) endpoint hit. Returning base page HTML.'); // Added debug log
  res.send(`
    <h1>The Human Tech Blog API</h1>
    <p>Server is running...</p>
    <a href="/health">Check health status</a>
  `);
});

// Error handler
interface HttpError extends Error {
  status?: number;
}
app.use(
  (err: HttpError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('🚨 Global Error Handler:', {
      path: req.path,
      method: req.method,
      body: req.body,
      error: err.stack || err.message,
    });
    const status = err.status || 500;
    const message = env.isProduction && status === 500 ? 'Something went wrong' : err.message;
    console.log(`[app.ts] Sending error response - Status: ${status}, Message: "${message}"`); // Added debug log
    return res
      .status(status)
      .json({ success: false, message, ...(!env.isProduction && { stack: err.stack }) });
  }
);

if (process.env.NODE_ENV !== 'test') {
  require('./config/passport');
  console.log('[app.ts] Passport configuration loaded for non-test environment.'); // Added debug log
}

export default app;
