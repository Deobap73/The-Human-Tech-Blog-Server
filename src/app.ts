// The-Human-Tech-Blog-Server\src\app.ts

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport'; // Keep this import
import { env } from './config/env';
import { i18nextMiddleware } from './i18n';

// Import only the centralized and robust CSRF middleware!
import { csrfWithLogging } from './middleware/csrfMiddleware';

// Import routes
import csrfRouter from './routes/csrf';
import setupRoutes from './routes/setupRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import contactRoutes from './routes/contact';
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
import sponsorRoutes from './routes/sponsor.routes';

const app = express();

// Debug/inline routes (keep for debug)
app.get('/api/notifications-debug', (_req, res) => {
  res.json({ ok: true, msg: 'Notificações debug OK!' });
});
app.get('/api/notifications-inline-test', (_req, res) => {
  res.json({ ok: true, msg: 'Notificações INLINE OK!' });
});

// Base middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18nextMiddleware.handle(require('./i18n').default));

// =========================
// CSRF PROTECTION GLOBAL
// =========================

// Secure endpoint to get CSRF token (frontend should fetch once per session)
// This already includes the csrfWithLogging middleware which adds the token to the XSRF-TOKEN cookie
app.get('/api/auth/csrf', csrfWithLogging, (req, res) => {
  // req.csrfToken() is added by csrfWithLogging (which uses csurf)
  // And the cookie XSRF-TOKEN is also set by the middleware csrf({ cookie: true, ... })
  return res.status(200).json({ csrfToken: req.csrfToken() });
});

// Global middleware to protect ALL /api routes
// Exceptions: refresh/csrf/health/login/register (do NOT require CSRF token)
app.use('/api', (req, res, next) => {
  if (
    (req.method === 'POST' &&
      (req.path === '/auth/refresh' ||
        req.path === '/auth/login' ||
        req.path === '/auth/register')) ||
    (req.method === 'GET' && req.path === '/auth/csrf') ||
    (req.method === 'GET' && req.path === '/health')
  ) {
    // These routes are excluded from CSRF. The refresh, login, and register routes should NOT require CSRF token,
    // as the goal is to refresh or create the session, and the refresh token is httpOnly.
    return next();
  }
  // Apply CSRF protection to all other /api routes
  return csrfWithLogging(req, res, next);
});

// Initialize Passport.js (ONLY ONCE!)
app.use(passport.initialize());

// =========================
// CSRF LEGACY ROUTE
// =========================
app.use('/api', csrfRouter);

// =========================
// MAIN ROUTES
// =========================

app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/moderation/comments', commentModerationRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/2fa', twofaRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/users', userAdminRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/users', userRoutes);
app.use('/api', tagRoutes); // Mounts tags directly at /api/tags, etc.
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);

// =========================
// HEALTH CHECKS & BASE PAGE
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
// ERROR HANDLER
// =========================
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
    return res
      .status(status)
      .json({ success: false, message, ...(!env.isProduction && { stack: err.stack }) });
  }
);

export default app;
