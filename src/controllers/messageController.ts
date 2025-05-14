// src/controllers/messageController.ts
import { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { IUser } from '../types/User';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, text } = req.body;
    const sender = (req.user as IUser)._id;
    const message = await Message.create({ conversationId, sender, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const user = req.user as IUser;

    if (!user?._id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    if (
      user.role !== 'admin' &&
      !conversation.participants.some((p) => p.toString() === String(user._id))
    ) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const messages = await Message.find({ conversationId });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get messages', error: err });
  }
};
