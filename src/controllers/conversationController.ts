// src/controllers/conversationController.ts

import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { IUser } from '../types/User';

// Get conversations for user or admin
export const getUserConversations = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    let filter: Record<string, any> = {};
    if (user.role !== 'admin') {
      filter = { participants: user._id };
    }
    const conversations = await Conversation.find(filter).populate(
      'participants',
      'name email role'
    );
    return res.status(200).json(conversations);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Admin creates or gets chat with user (1:1)
export const createOrGetConversation = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { userId } = req.body; // userId to chat with (must be a normal user)
  if (user.role !== 'admin') return res.status(403).json({ error: 'Only admin can initiate chat' });
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    // Prevent admin-admin and user-user
    const exists = await Conversation.findOne({
      participants: { $all: [user._id, userId], $size: 2 },
    });
    if (exists) return res.status(200).json(exists);

    // Always [admin, user]
    const newConv = await Conversation.create({ participants: [user._id, userId] });
    return res.status(201).json(newConv);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
};
