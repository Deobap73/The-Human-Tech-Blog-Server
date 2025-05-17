// src/controllers/messageController.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { IUser } from '../types/User';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as IUser;
  const { conversationId } = req.params;

  try {
    const userId = new Types.ObjectId(user._id as string);
    const conversation = await Conversation.findById(conversationId);

    if (
      !conversation ||
      (!user.role.includes('admin') && !conversation.participants.some((p) => p.equals(userId)))
    ) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const messages = await Message.find({ conversation: conversationId }).populate(
      'sender',
      'name'
    );
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as IUser;
  const { conversationId } = req.params;
  const { text } = req.body;

  try {
    const userId = new Types.ObjectId(user._id as string);
    const conversation = await Conversation.findById(conversationId);

    if (
      !conversation ||
      (!user.role.includes('admin') && !conversation.participants.some((p) => p.equals(userId)))
    ) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: userId,
      text,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};
