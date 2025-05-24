// src/controllers/reactionController.ts

import { Request, Response } from 'express';
import Reaction from '../models/Reaction';
import { IUser } from '../types/User';
import { getSocketIO } from '../socket/io';

// Toggle (adicionar/remover) reação a posts/comentários
export const toggleReaction = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { targetType, targetId, emoji } = req.body;

  if (!['post', 'comment'].includes(targetType) || !targetId || !emoji) {
    return res.status(400).json({ message: 'Invalid reaction data' });
  }

  try {
    const userObj = user as IUser;
    const userId = typeof userObj._id === 'string' ? userObj._id : String(userObj._id);

    const existing = await Reaction.findOne({
      targetType,
      targetId,
      userId,
      emoji,
    });

    if (existing) {
      await existing.deleteOne();

      // Emitir evento realtime pelo socket.io
      getSocketIO().emit('reaction:updated', { targetType, targetId });

      return res.status(200).json({ message: 'Reaction removed' });
    } else {
      await Reaction.create({
        targetType,
        targetId,
        userId,
        emoji,
      });

      // Emitir evento realtime pelo socket.io
      getSocketIO().emit('reaction:updated', { targetType, targetId });

      return res.status(201).json({ message: 'Reaction added' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Failed to toggle reaction' });
  }
};

// Listar todas as reações de um post ou comentário
export const getReactions = async (req: Request, res: Response) => {
  const { targetType, targetId } = req.query;
  if (!['post', 'comment'].includes(targetType as string) || !targetId) {
    return res.status(400).json({ message: 'Invalid query' });
  }
  try {
    const reactions = await Reaction.find({
      targetType,
      targetId,
    });
    return res.status(200).json(reactions);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch reactions' });
  }
};
