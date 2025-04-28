import { Request, Response } from 'express';
import Message from '../models/Message';
import { IUser } from '../models/User';

export const sendMessage = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { conversationId, text } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({ message: 'Conversation ID and text are required' });
  }

  try {
    const newMessage = new Message({
      conversationId,
      sender: (req.user as IUser)._id,
      text,
    });

    const savedMessage = await newMessage.save();
    return res.status(201).json(savedMessage);
  } catch (error) {
    console.error('[sendMessage]', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).sort({
      createdAt: 1,
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error('[getMessages]', error);
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
};
