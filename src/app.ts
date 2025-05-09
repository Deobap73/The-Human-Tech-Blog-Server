// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import cookieParser from 'cookie-parser';
import cors from 'cors';
import setupRoutes from './routes/setupRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import reactionRoutes from './routes/reactionRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import passport from 'passport';
import './config/passport';
import { env } from './config/env';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ⚠️ Redis session temporarily disabled
// app.use(
//   session({ ... })
// );

app.use(passport.initialize());
// app.use(passport.session()); // Only if using express-session

app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

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

// Only initialize Passport in non-test environments
if (process.env.NODE_ENV !== 'test') {
  require('./config/passport');
}

export default app;
