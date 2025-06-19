// The-Human-Tech-Blog-Server/src/socket/index.ts

import { Server } from 'socket.io';
import { registerChatHandlers } from './handlers/chatHandler';
import { registerNotificationHandlers } from './handlers/notificationHandler';
import { registerReactionHandlers } from './handlers/reactionHandler';
import { socketAuthMiddleware } from './middleware/authMiddleware';

// Variável para armazenar a instância 'io' globalmente dentro deste módulo
let globalIo: Server;

/**
 * Configura os listeners e handlers do Socket.IO.
 * Esta função deve ser chamada UMA ÚNICA VEZ na inicialização do servidor.
 * @param io A instância do Socket.IO Server.
 */
export const setupSocket = (io: Server) => {
  globalIo = io; // Armazena a instância 'io' para que possa ser acessada por getSocketIO

  // Aplica middlewares globais do Socket.IO
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Chat handlers (chat:join, chat:leave, chat:message, etc.)
    registerChatHandlers(io, socket);

    // Outros handlers (notifications, reactions)
    registerNotificationHandlers(io, socket);
    registerReactionHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

/**
 * Retorna a instância global do Socket.IO Server.
 * Deve ser chamada SOMENTE após `setupSocket` ter sido executado.
 * @returns A instância do Socket.IO Server.
 * @throws Error se a instância do Socket.IO não tiver sido inicializada.
 */
export const getSocketIO = (): Server => {
  if (!globalIo) {
    console.warn(
      'Socket.IO instance not initialized. Ensure setupSocket is called in your server entry point.'
    );
    throw new Error('Socket.IO instance not initialized. Cannot retrieve it.');
  }
  return globalIo;
};
