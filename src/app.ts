// src/app.ts

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import './config/passport';
import { env } from './config/env';
import { i18nextMiddleware } from './i18n';

// Import security middleware (Helmet, mongoSanitize)
import { setupSecurityMiddleware } from './middleware/securityMiddleware';

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

// =========================
// Security Middlewares
// =========================

// Apply Helmet and mongoSanitize (critical for production)
setupSecurityMiddleware(app);

// =========================
// Base middlewares
// =========================
app.use(cookieParser());
app.use(
  cors({
    origin: env.isProduction ? 'https://thehumantechblog.com' : 'http://localhost:5173',
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
app.get('/api/auth/csrf', csrfWithLogging, (req, res) => {
  return res.status(200).json({ csrfToken: req.csrfToken() });
});

// Global middleware to protect ALL /api routes
app.use('/api', (req, res, next) => {
  // Exclude upload, login, refresh, register, health, csrf
  if (
    (req.method === 'POST' &&
      (req.path === '/auth/refresh' ||
        req.path === '/auth/login' ||
        req.path === '/auth/register' ||
        req.path === '/posts/upload')) ||
    (req.method === 'GET' && req.path === '/auth/csrf') ||
    (req.method === 'GET' && req.path === '/health')
  ) {
    return next();
  }
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
app.use('/api', tagRoutes);
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
