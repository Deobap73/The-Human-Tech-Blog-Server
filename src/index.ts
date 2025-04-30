// The-Human-Tech-Blog-Server/src/index.ts

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });
//
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import { connectDB } from './config/db';
import setupRoutes from './routes/setupRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import postRoutes from './routes/postRoutes';
import passport from 'passport';
import './config/passport';
import { env } from './config/env'; // Importe a configuração validada

const app = express();
const PORT = env.PORT || 5000; // Usa a porta do env validado

// Configuração de middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para parsing de formulários
app.use(cookieParser());

// Configuração CORS mais segura
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Configuração de sessão com Redis
const RedisStore = connectRedis(session);
const redisClient = new Redis(env.REDIS_URL);

app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'sess:',
      ttl: 86400, // 1 dia em segundos
    }),
    name: 'sessionId', // Nome personalizado do cookie
    secret: env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.isProduction, // HTTPS em produção
      httpOnly: true,
      sameSite: env.isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
    },
  })
);

// Conexão com o banco de dados
connectDB()
  .then(() => console.log('📦 Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Configuração do Passport (OAuth)
app.use(passport.initialize());
app.use(passport.session());

// Rotas da aplicação
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);

// Rota de health check
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Rota raiz
app.get('/', (_, res) => {
  res.send(`
    <h1>The Human Tech Blog API</h1>
    <p>Server is running on port ${PORT}</p>
    <a href="/health">Check health status</a>
  `);
});

// Interface para erros customizados
interface HttpError extends Error {
  status?: number;
}

/// Middleware de erro global
app.use(
  (
    err: HttpError,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction // Prefixo _ indica uso intencionalmente omitido
  ) => {
    console.error('🚨 Error:', {
      path: req.path,
      method: req.method,
      body: req.body,
      error: err.stack || err.message,
    });

    const status = err.status || 500;
    const message = env.isProduction && status === 500 ? 'Something went wrong' : err.message;

    return res.status(status).json({
      success: false,
      message,
      ...(!env.isProduction && { stack: err.stack }),
    });
  }
);

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 Server ready at: http://localhost:${PORT}
  📚 API docs: http://localhost:${PORT}/api-docs
  `);
});
