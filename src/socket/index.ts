// src/socket/index.ts
import { Server } from 'socket.io';
import { socketAuthMiddleware } from './middleware/authMiddleware';
import { registerMessageHandlers } from './handlers/messageHandler';
import { registerNotificationHandlers } from './handlers/notificationHandler';
import { registerReactionHandlers } from './handlers/reactionHandler';

export const setupSocket = (io: Server) => {
  io.use(socketAuthMiddleware);
  io.on('connection', (socket) => {
    registerMessageHandlers(socket);
    registerNotificationHandlers(io, socket);
    registerReactionHandlers(io, socket);
  });
};
