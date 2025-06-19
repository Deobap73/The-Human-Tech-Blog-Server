// /src/controllers/messageController.ts

import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { IUser } from '../types/User';
import { getSocketIO } from '../socket/index'; // Import for socket emit

// Get all messages from a conversation
export const getMessages = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { conversationId } = req.params;

  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Accepts ObjectId or string
    const idStr = typeof user._id === 'string' ? user._id : String(user._id);
    const isParticipant = conv.participants.some((p) => String(p) === idStr);

    if (!isParticipant && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const messages = await Message.find({ conversation: conversationId }).populate(
      'sender',
      'name email avatar role'
    );
    return res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send message (REST) + Emit via Socket
export const sendMessage = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { conversationId } = req.params;
  const { text } = req.body;

  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const idStr = typeof user._id === 'string' ? user._id : String(user._id);
    const isParticipant = conv.participants.some((p) => String(p) === idStr);

    if (!isParticipant && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const msg = await Message.create({
      conversation: conversationId,
      sender: user._id,
      text,
    });

    // Populate sender for frontend use
    const populatedMsg = await msg.populate('sender', 'name email avatar role');

    // --- EMIT TO SOCKET.IO ROOM ---
    try {
      const io = getSocketIO();
      io.to(conversationId).emit('chat:newMessage', {
        ...populatedMsg.toObject(),
      });
    } catch (e) {
      // Log only, do not break REST
      console.warn('[sendMessage] Unable to emit message via socket:', e);
    }
    // ------------------------------

    return res.status(201).json(populatedMsg);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
