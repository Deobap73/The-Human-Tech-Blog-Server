// src/controllers/conversationController.ts

import { Request, Response } from 'express';
import Conversation from '../models/Conversation';

export const createConversation = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: 'Missing users' });
  }

  try {
    const existing = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const conversation = new Conversation({ participants: [senderId, receiverId] });
    await conversation.save();

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('[createConversation]', error);
    return res.status(500).json({ error: 'Could not create conversation' });
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const conversations = await Conversation.find({ participants: userId });
    return res.status(200).json(conversations);
  } catch (error) {
    console.error('[getUserConversations]', error);
    return res.status(500).json({ error: 'Failed to get conversations' });
  }
};
