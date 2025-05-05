// The-Human-Tech-Blog-Server/src/controllers/reactionController.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Reaction from '../models/Reaction';
import { IUser } from '../models/User';

export const toggleReaction = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { postId, type } = req.body;

  try {
    const existing = await Reaction.findOne({ postId, userId: user._id });
    if (existing) {
      if (existing.type === type) {
        await existing.deleteOne();
        return res.status(200).json({ message: 'Reaction removed' });
      } else {
        existing.type = type;
        await existing.save();
        return res.status(200).json({ message: 'Reaction updated' });
      }
    } else {
      await Reaction.create({ postId, userId: user._id, type });
      return res.status(201).json({ message: 'Reaction added' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process reaction' });
  }
};

export const getReactions = async (req: Request, res: Response) => {
  try {
    const reactions = await Reaction.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(req.params.postId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);
    return res.status(200).json(reactions);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reactions' });
  }
};
