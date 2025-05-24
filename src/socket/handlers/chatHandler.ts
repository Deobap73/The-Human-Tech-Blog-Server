// The-Human-Tech-Blog-Server/src/socket/handlers/chatHandler.ts

import { Server, Socket } from 'socket.io';
import { Message } from '../../models/Message';
import { Conversation } from '../../models/Conversation';

export function registerChatHandlers(io: Server, socket: Socket) {
  // Join a conversation room
  socket.on('chat:join', (conversationId: string) => {
    socket.join(conversationId);
  });

  // Leave a conversation room
  socket.on('chat:leave', (conversationId: string) => {
    socket.leave(conversationId);
  });

  // Handle sending message
  socket.on('chat:message', async ({ conversationId, text }) => {
    const user = socket.data.user;
    if (!user) return;

    const conv = await Conversation.findById(conversationId);
    if (!conv) return;
    const idStr = typeof user._id === 'string' ? user._id : String(user._id);
    if (!conv.participants.some((p) => String(p) === idStr)) return;

    const msg = await Message.create({
      conversation: conversationId,
      sender: user._id,
      text,
    });

    // Emit new message to room
    io.to(conversationId).emit('chat:newMessage', {
      ...msg.toObject(),
      sender: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  });
}
