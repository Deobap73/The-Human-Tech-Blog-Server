// src/controllers/reactionController.ts

import { Request, Response } from 'express';
import Reaction from '../models/Reaction';
import { IUser } from '../types/User';

// Adicionar/trocar/remover reação (toggle)
export const toggleReaction = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { targetType, targetId, emoji } = req.body;

  if (!['post', 'comment'].includes(targetType) || !targetId || !emoji) {
    return res.status(400).json({ message: 'Invalid reaction data' });
  }

  try {
    // Garantir sempre string
    const userId =
      typeof user._id === 'string'
        ? user._id
        : user._id && typeof user._id.toString === 'function'
          ? user._id.toString()
          : '';

    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const existing = await Reaction.findOne({
      targetType,
      targetId,
      userId,
      emoji,
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ message: 'Reaction removed' });
    } else {
      await Reaction.create({
        targetType,
        targetId,
        userId,
        emoji,
      });
      return res.status(201).json({ message: 'Reaction added' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Failed to toggle reaction' });
  }
};

// Listar reações por target (post ou comment)
export const getReactions = async (req: Request, res: Response) => {
  const targetType = req.query.targetType as string;
  const targetId = req.query.targetId as string;

  if (!['post', 'comment'].includes(targetType) || !targetId) {
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
