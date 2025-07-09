// /src/app.ts

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import './config/passport';
import { env } from './config/env';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import i18nextConfig from './i18n';

import { setupSecurityMiddleware } from './middleware/securityMiddleware';
import { csrfWithLogging } from './middleware/csrfMiddleware';

// Import route modules
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
setupSecurityMiddleware(app);

// =========================
// Base Middlewares
// =========================
app.use(cookieParser());

// Initialize i18n
i18next.use(i18nextMiddleware.LanguageDetector).init(i18nextConfig);
app.use(i18nextMiddleware.handle(i18next));

// CORS Configuration
const allowedOrigins = [env.CLIENT_URL];
if (!env.isProduction) {
  allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin && !env.isProduction) return callback(null, true);
      if (origin && allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'XSRF-TOKEN'],
    exposedHeaders: ['Set-Cookie'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// CSRF Protection
// =========================
app.get('/api/auth/csrf', csrfWithLogging, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});
app.use((req, res, next) => {
  const openPaths = [
    '/auth/refresh',
    '/auth/login',
    '/auth/register',
    '/posts/upload',
    '/auth/csrf',
    '/health',
  ];
  if (req.method === 'GET' && req.path === '/health') return next();
  if (req.method === 'POST' && openPaths.includes(req.path)) return next();
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
