// The-Human-Tech-Blog-Server/src/index.ts

import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import { connectDB } from './config/db';
// import Routes
import authRoutes from './routes/authRoutes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/auth', authRoutes);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Redis setup
const RedisStore = connectRedis(session);
const redisClient = new Redis(process.env.REDIS_URL as string);

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.JWT_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// Connect DB
connectDB();

// Test route
app.get('/', (_, res) => {
  res.send('The Human Tech Blog API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
