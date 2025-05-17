// src/controllers/conversationController.ts
import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { IUser } from '../types/User';

export const getUserConversations = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as IUser;

  try {
    const query = user.role === 'admin' ? {} : { participants: user._id };

    const conversations = await Conversation.find(query).populate('participants', 'name email');
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};
