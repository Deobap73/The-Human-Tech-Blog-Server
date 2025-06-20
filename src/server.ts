// src/server.ts
import { env } from './config/env';
import app from './app';
import { connectDB } from './config/db';
import { createServer } from 'http';
import { setupSocket } from './socket'; // Importe do arquivo index.ts

const PORT = env.PORT || 5000;
const httpServer = createServer(app);

connectDB()
  .then(() => {
    console.log('📦 Connected to MongoDB');

    // Configuração do Socket.IO movida para setupSocket
    setupSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
      console.log(`📡 Socket.IO available at: ws://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
