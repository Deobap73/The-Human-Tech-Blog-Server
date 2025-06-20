// The-Human-Tech-Blog-Server/src/socket/index.ts

import { Server } from 'socket.io';
import { registerChatHandlers } from './handlers/chatHandler';
import { registerNotificationHandlers } from './handlers/notificationHandler';
import { registerReactionHandlers } from './handlers/reactionHandler';
import { socketAuthMiddleware } from './middleware/authMiddleware';
import { env } from '../config/env';

let globalIo: Server;

export const setupSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'https://thehumantechblog.com', 'https://www.thehumantechblog.com'],
      credentials: true,
    },
  });

  globalIo = io;

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    registerChatHandlers(io, socket);
    registerNotificationHandlers(io, socket);
    registerReactionHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const getSocketIO = (): Server => {
  if (!globalIo) {
    throw new Error('Socket.IO not initialized');
  }
  return globalIo;
};
