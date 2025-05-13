// src/socket/handlers/messageHandler.ts
import { Server, Socket } from 'socket.io';
import Message from '@/models/Message';
import { ChatMessage } from '@/types/ChatMessage';

export const registerMessageHandlers = (io: Server, socket: Socket) => {
  socket.on('message:create', async (payload: ChatMessage) => {
    try {
      if (!socket.user) return;

      const newMessage = new Message({
        sender: socket.user._id,
        conversationId: payload.conversationId,
        text: payload.text,
      });

      const savedMessage = await newMessage.save();

      io.to(payload.conversationId).emit('message:received', savedMessage);
    } catch (err) {
      console.error('message:create error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
};
