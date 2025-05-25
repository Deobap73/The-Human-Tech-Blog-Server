// src/controllers/commentController.ts

import { Request, Response } from 'express';
import Comment from '../models/Comment';
import { IUser } from '../types/User';

// ✅ Criar comentário
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

// ✅ Obter comentários de um post
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    return res.status(200).json(comments);
  } catch (error) {
    console.error('[Get Comments]', error);
    return res.status(500).json({ error: 'Failed to load comments' });
  }
};

// ✅ Apagar comentário (admin ou próprio autor)
export const deleteComment = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const commentId = req.params.id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const commentAuthor = comment.userId.toString();
    const userId = typeof user._id === 'string' ? user._id : (user._id as any).toString();

    if (commentAuthor !== userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not the author or admin' });
    }

    await comment.deleteOne();

    return res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('[Delete Comment]', err);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }
};

export const getPendingCommentsCount = async (_: Request, res: Response) => {
  try {
    const count = await Comment.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ count: 0 });
  }
};
