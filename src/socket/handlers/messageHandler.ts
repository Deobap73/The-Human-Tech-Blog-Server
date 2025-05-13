// src/socket/handlers/messageHandler.ts
import { Socket } from 'socket.io';
import MessageModel from '@/models/Message';
import { ChatMessage } from '@/types/ChatMessage';

export const registerMessageHandlers = (socket: Socket) => {
  socket.on('message:create', async (msg: ChatMessage) => {
    try {
      const saved = await MessageModel.create({
        text: msg.text,
        conversationId: msg.conversationId,
        sender: socket.data.user._id,
      });

      // Emite para o remetente
      socket.emit('message:new', saved);

      // Emite para o destinatário (broadcast)
      socket.to(msg.conversationId).emit('message:new', saved);
    } catch (err) {
      socket.emit('message:error', 'Failed to save message');
    }
  });
};
