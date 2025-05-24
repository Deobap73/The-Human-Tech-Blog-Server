// src/controllers/commentController.ts

import { Request, Response } from 'express';
import Comment from '../models/Comment';
import { IUser } from '../types/User';
import { Types } from 'mongoose';

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
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Garante conversão segura dos IDs
    const authorId =
      comment.userId instanceof Types.ObjectId ? comment.userId.toString() : String(comment.userId);

    const userId = user._id instanceof Types.ObjectId ? user._id.toString() : String(user._id);

    if (authorId !== userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to delete this comment' });
    }

    await comment.deleteOne();
    return res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('[Delete Comment]', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
};
