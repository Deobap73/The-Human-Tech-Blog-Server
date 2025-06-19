// /src/socket/handlers/chatHandler.ts
import { Server, Socket } from 'socket.io';
import { Message } from '../../models/Message';
import { Conversation } from '../../models/Conversation';

/**
 * Registers all chat-related socket events for a user socket connection.
 * Handles joining/leaving conversations and sending/receiving messages.
 *
 * @param io - The Socket.IO server instance
 * @param socket - The connected user's socket
 */
export function registerChatHandlers(io: Server, socket: Socket) {
  // User joins a conversation (room)
  socket.on('chat:join', (conversationId: string) => {
    socket.join(conversationId);
  });

  // User leaves a conversation (room)
  socket.on('chat:leave', (conversationId: string) => {
    socket.leave(conversationId);
  });

  /**
   * Send a new message in a conversation.
   * - Saves to DB.
   * - Emits to all participants in the conversation.
   */
  socket.on(
    'chat:message',
    async ({ conversationId, text }: { conversationId: string; text: string }) => {
      try {
        const user = socket.data.user;
        if (!user) {
          socket.emit('chat:error', 'Unauthorized');
          return;
        }

        // Ensure conversation exists
        const conv = await Conversation.findById(conversationId);
        if (!conv) {
          socket.emit('chat:error', 'Conversation not found');
          return;
        }

        // Validate participation
        const idStr = typeof user._id === 'string' ? user._id : String(user._id);
        if (!conv.participants.some((p) => String(p) === idStr) && user.role !== 'admin') {
          socket.emit('chat:error', 'Not a participant');
          return;
        }

        // Create and save message
        const msg = await Message.create({
          conversation: conversationId,
          sender: user._id,
          text,
        });

        // Populate sender for UI
        const populatedMsg = await msg.populate('sender', 'name email avatar role');

        // Emit to all users in the conversation room
        io.to(conversationId).emit('chat:newMessage', {
          ...populatedMsg.toObject(),
        });

        return;
      } catch (err) {
        socket.emit('chat:error', 'Failed to send message');
        return;
      }
    }
  );
}
