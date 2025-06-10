// The-Human-Tech-Blog-Server/src/socket/index.ts
import { Server } from 'socket.io';
// CORRIGIDO: Mudando para named imports e usando os nomes corretos das funções exportadas.
import { registerChatHandlers } from './handlers/chatHandler';
import { registerMessageHandlers } from './handlers/messageHandler';
import { registerNotificationHandlers } from './handlers/notificationHandler';
import { registerReactionHandlers } from './handlers/reactionHandler';
import { socketAuthMiddleware } from './middleware/authMiddleware'; // Usando o nome correto 'socketAuthMiddleware'

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
  io.use(socketAuthMiddleware); // Usando o nome correto da função importada

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Configura os handlers para diferentes tipos de eventos Socket.IO
    // A instância 'io' é passada para cada handler para permitir emitir eventos globais.
    // Usando os nomes corretos das funções importadas
    registerChatHandlers(io, socket);
    registerMessageHandlers(socket); // Nota: messageHandler.ts só aceita 'socket'
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
    // Loga um aviso se a instância não foi inicializada, útil para depuração em desenvolvimento.
    console.warn(
      'Socket.IO instance not initialized. Ensure setupSocket is called in your server entry point.'
    );
    // Em produção, você pode preferir lançar um erro para falhas mais explícitas.
    throw new Error('Socket.IO instance not initialized. Cannot retrieve it.');
  }
  return globalIo;
};
