// src/server.ts
import { env } from './config/env';
import app from './app';
import { connectDB } from './config/db';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocketIO } from './socket/io';
import { setupSocket } from './socket';

const PORT = env.PORT || 5000;
const httpServer = createServer(app);
console.log(`[server.ts] HTTP server created on port: ${PORT}`); // Added debug log
initSocketIO(httpServer);
console.log('[server.ts] Socket.IO initialized with HTTP server.'); // Added debug log

connectDB()
  .then(() => {
    console.log('📦 Connected to MongoDB');

    const httpServer = createServer(app);
    console.log('[server.ts] Second HTTP server created for Socket.IO.'); // Added debug log
    const io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:5173',
        credentials: true,
      },
    });
    console.log('[server.ts] Socket.IO server configured with CORS.'); // Added debug log

    setupSocket(io); // ✅ registra eventos socket
    console.log('[server.ts] Socket events registered.'); // Added debug log

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('[server.ts] Exiting process due to MongoDB connection error.'); // Added debug log
    process.exit(1);
  });
