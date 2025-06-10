// src/server.ts
import { env } from './config/env';
import app from './app';
import { connectDB } from './config/db';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './socket';

const PORT = env.PORT || 5000;
// Crie APENAS UM servidor HTTP que servirá tanto o Express quanto o Socket.IO
const httpServer = createServer(app);
console.log(`[server.ts] HTTP server created on port: ${PORT}`);

connectDB()
  .then(() => {
    console.log('📦 Connected to MongoDB');

    // Inicialize o Socket.IO com o *mesmo* httpServer
    const io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:5173',
        credentials: true,
      },
    });
    console.log('[server.ts] Socket.IO server configured with CORS.');

    setupSocket(io); // ✅ registra eventos socket
    console.log('[server.ts] Socket events registered.');

    // O único servidor HTTP escuta na porta
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('[server.ts] Exiting process due to MongoDB connection error.');
    process.exit(1);
  });
