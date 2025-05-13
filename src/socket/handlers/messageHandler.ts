// src/socket/handlers/messageHandler.ts
import { Socket } from 'socket.io';
import MessageModel from '@/models/Message';
import ConversationModel from '@/models/Conversation';
import { ChatMessage } from '@/types/ChatMessage';

export const registerMessageHandlers = (socket: Socket) => {
  socket.on('message:create', async (msg: ChatMessage) => {
    try {
      const userId = socket.data.user._id;
      const conversation = await ConversationModel.findById(msg.conversationId);

      if (!conversation) {
        socket.emit('message:error', 'Conversation not found');
        return;
      }

      const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === userId.toString()
      );

      if (!isParticipant) {
        socket.emit('message:error', 'Not authorized to send message to this conversation');
        return;
      }

      const saved = await MessageModel.create({
        text: msg.text,
        conversationId: msg.conversationId,
        sender: userId,
      });

      socket.emit('message:new', saved);
      socket.to(msg.conversationId).emit('message:new', saved);
    } catch (err) {
      socket.emit('message:error', 'Failed to save message');
    }
  });
};
