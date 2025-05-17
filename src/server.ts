// src/server.ts
import { env } from './config/env';
import app from './app';
import { connectDB } from './config/db';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './socket';

const PORT = env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('📦 Connected to MongoDB');

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:5173',
        credentials: true,
      },
    });

    setupSocket(io); // ✅ registra eventos socket

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
