// The-Human-Tech-Blog-Server/src/controllers/messageController.ts

import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { IUser } from '../types/User';

// Obter mensagens de uma conversa (admin pode aceder a tudo)
export const getMessages = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { conversationId } = req.params;

  try {
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Aceita ObjectId ou string
    const idStr = typeof user._id === 'string' ? user._id : String(user._id);
    const isParticipant = conv.participants.some((p) => String(p) === idStr);

    if (!isParticipant && user.role !== 'admin') {
      console.log(
        'User not allowed:',
        idStr,
        conv.participants.map((p) => String(p)),
        user.role
      );
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

// Enviar mensagem (só participantes/admin)
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

    // TODO: Emitir via socket.io se aplicável

    return res.status(201).json(msg);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
