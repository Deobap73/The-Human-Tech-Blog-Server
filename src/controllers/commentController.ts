import { Request, Response } from 'express';
import Comment from '../models/Comment';
import { IUser } from '../models/User';

export const createComment = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.name) return res.status(401).json({ error: 'Unauthorized' });

  const { postId, text } = req.body;

  try {
    const comment = await Comment.create({
      postId,
      userId: user._id,
      userName: user.name,
      text,
    });
    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create comment' });
  }
};
