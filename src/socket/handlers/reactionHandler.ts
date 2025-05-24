// The-Human-Tech-Blog-Server/src/socket/handlers/reactionHandler.ts

import { Server, Socket } from 'socket.io';

// Aqui poderás usar dependências de mongoose e models se precisares de fetch de info extra

export function registerReactionHandlers(_io: Server, socket: Socket) {
  // Exemplo: Receber pedido para adicionar/trocar reação (opcional, se quiser interação via socket, normalmente o REST faz isto)
  socket.on('reaction:toggle', async (_data) => {
    // data: { targetType, targetId, emoji }
    // Aqui irias fazer update via controller se quiseres, ou só emitir notificação.
    // Normalmente, ao salvar a reação via API REST, tu emites o evento no controller (ver abaixo).
  });

  // Não é obrigatório ter lógica aqui se fazes tudo via REST!
}
