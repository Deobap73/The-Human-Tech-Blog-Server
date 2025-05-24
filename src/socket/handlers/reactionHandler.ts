// src/socket/handlers/reactionHandler.ts

import { Server, Socket } from 'socket.io';

// Se não usares io, prefixa com _ para evitar warning
export function registerReactionHandlers(_io: Server, socket: Socket) {
  socket.on('reaction:toggle', ({ targetType, targetId }) => {
    // Broadcast para todos os sockets (menos o atual)
    socket.broadcast.emit('reaction:update', { targetType, targetId });
  });
}
