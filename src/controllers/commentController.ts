// The-Human-Tech-Blog-Server\src\controllers\commentController.ts

import { Request, Response } from 'express';
import Comment from '../models/Comment';
import { IUser } from '../models/User';

export const createComment = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user || !user.name) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { postId, text } = req.body;

  if (!postId || !text) {
    return res.status(400).json({ message: 'postId and text are required' });
  }

  try {
    const comment = await Comment.create({
      postId,
      userId: user._id,
      userName: user.name,
      text,
    });
    return res.status(201).json(comment);
  } catch (error) {
    console.error('[Create Comment]', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    return res.status(200).json(comments);
  } catch (error) {
    console.error('[Get Comments]', error);
    return res.status(500).json({ error: 'Failed to load comments' });
  }
};
