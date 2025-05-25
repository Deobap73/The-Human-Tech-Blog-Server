// The-Human-Tech-Blog-Server/src/app.ts

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import passport from 'passport';
import './config/passport';
import { env } from './config/env';

// Import das rotas (mantém igual ao teu!)
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

const app = express();

// 1. Cookies e CORS
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// 2. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. CSRF protection middleware (MODO CORRETO)
// Só para rotas que alteram estado! Aplica nas rotas API exceto GET do csrf e health.
const csrfProtection = csrf({
  cookie: {
    httpOnly: false,
    sameSite: 'lax',
    secure: env.isProduction,
  },
});

// 2️⃣ Aplica csrfProtection DIRETAMENTE na rota que devolve o token:
app.get('/api/auth/csrf', csrfProtection, (req, res) => {
  return res.status(200).json({ csrfToken: req.csrfToken() });
});

// ** Aplica o csrfProtection ANTES da rota que usa req.csrfToken **
app.use('/api', (req, res, next) => {
  // Só ativa csrfProtection se NÃO for GET do csrf ou health check!
  if (
    (req.method === 'POST' && req.path === '/auth/refresh') ||
    (req.method === 'GET' && req.path === '/auth/csrf') ||
    (req.method === 'GET' && req.path === '/health')
  ) {
    return next();
  }
  return csrfProtection(req, res, next);
});

// ** Rota pública para pedir o token CSRF **
app.get('/api/auth/csrf', (req, res) => {
  return res.status(200).json({ csrfToken: req.csrfToken() });
});

app.use(passport.initialize());

// 🔁 Rotas protegidas
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
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

// Error handler
interface HttpError extends Error {
  status?: number;
}
app.use(
  (err: HttpError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('🚨 Error:', {
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

if (process.env.NODE_ENV !== 'test') {
  require('./config/passport');
}

export default app;
