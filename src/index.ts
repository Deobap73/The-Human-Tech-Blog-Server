import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';

dotenv.config(); // Load environment variables

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// -------------------- MIDDLEWARE BASE --------------------

// 🔐 Parse JSON body (must come before routes)
app.use(express.json());

// 🌐 Enable CORS with credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// 🍪 Enable cookie parsing
app.use(cookieParser());

// -------------------- REDIS SESSION SETUP --------------------

const RedisStore = connectRedis(session);
const redisClient = new Redis(process.env.REDIS_URL as string);

// 💾 Session configuration (stored in Redis)
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'sess:',
    }) as any, // Force type due to mismatch in RedisStore typings
    secret: process.env.JWT_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set true in production with HTTPS
      httpOnly: true, // Prevent client-side access
      sameSite: 'lax', // Helps prevent CSRF
    },
  })
);

// -------------------- DATABASE & ROUTES --------------------

// ⚙️ Connect to MongoDB
connectDB();

// 🔗 Load all routes
app.use('/api/auth', authRoutes);

// 🧪 Health check route
app.get('/', (_, res) => {
  res.send('The Human Tech Blog API is running');
});

// -------------------- START SERVER --------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
