// The-Human-Tech-Blog-Server/src/app.ts

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import './config/passport';
import { env } from './config/env';
import i18next from './i18n';
import i18nextMiddleware from 'i18next-http-middleware';
import compression from 'compression';

import { setupSecurityMiddleware } from './middleware/securityMiddleware';
import { csrfWithLogging } from './middleware/csrfMiddleware';
import { debugBodySize } from './middleware/debugBodySize';
import { buildRootRouter } from './routes';

const app = express();

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

// Trust proxy (needed for correct IPs behind proxies)
app.set('trust proxy', 1);

// =========================
// Security Middlewares
// =========================
setupSecurityMiddleware(app);

// =========================
// Base Middlewares
// =========================
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
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

// =====================================
// Body Parsers
// =====================================
const BODY_LIMIT = process.env.BODY_LIMIT ?? '5mb';
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

// Initialize i18n
app.use(i18nextMiddleware.handle(i18next));

// Dev-only: log body size for posts
if (env.NODE_ENV !== 'production') {
  app.use('/api/posts', debugBodySize);
}

// =========================
// CSRF Protection
// =========================

// 1. Endpoint to generate CSRF token and set cookies
app.get('/api/auth/csrf', csrfWithLogging, (req, res) => {
  const token = req.csrfToken();

  console.log('[CSRF][DEBUG][START] Generating CSRF token:', token);
  console.log('[CSRF][DEBUG] NODE_ENV:', env.NODE_ENV);
  console.log('[CSRF][DEBUG] Request headers:', req.headers);
  console.log('[CSRF][DEBUG] Received cookies:', req.cookies);

  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: env.NODE_ENV === 'production' ? '.thehumantechblog.com' : undefined,
    path: '/',
  });

  console.log('[CSRF][DEBUG][Set-Cookie] XSRF-TOKEN set with token value.');

  if ((req as any).cookies?._csrfSecret) {
    res.cookie('_csrfSecret', (req as any).cookies._csrfSecret, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: env.NODE_ENV === 'production' ? '.thehumantechblog.com' : undefined,
      path: '/',
    });
    console.log('[CSRF][DEBUG][Set-Cookie] _csrfSecret cookie re-set (debug).');
  }

  console.log('[CSRF][DEBUG][RESPONSE] Returning JSON with csrfToken.');
  res.status(200).json({ csrfToken: token });
});

// 2. Apply CSRF protection to all mutating requests except certain paths
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
// Routes
// =========================
app.use(buildRootRouter());

// =========================
// Compression
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
type HttpError = Error & { status?: number };

app.use(
  (err: HttpError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    let bodyInfo: string = '[no body]';
    try {
      const serialized = JSON.stringify(req.body);
      if (serialized) {
        const len = Buffer.byteLength(serialized);
        bodyInfo = len <= 1000 ? serialized : `[[body length: ${len} bytes]]`;
      }
    } catch {
      bodyInfo = '[unserializable body]';
    }

    console.error('🚨 Global Error Handler:', {
      path: req.path,
      method: req.method,
      body: bodyInfo,
      error: err.stack || err.message,
      name: err.name,
    });

    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message,
      name: err.name,
    });
  }
);

export default app;
