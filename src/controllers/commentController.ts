// src/controllers/commentController.ts

import { Request, Response } from 'express';
import Comment from '../models/Comment';
import { IUser } from '../types/User';
import crypto from 'crypto';

function sanitize(s: string) {
  return s.replace(/<[^>]*>/g, '').trim();
}

// Criar comentário
export const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    const { postId, text, guestName, guestEmail, guestWebsite, recaptchaScore } = req.body;

    if (!postId || !text) {
      return res.status(400).json({ message: 'postId and text are required' });
    }

    const cleanText = sanitize(text);
    if (cleanText.length < 3) {
      return res.status(400).json({ message: 'Comment too short' });
    }

    const base = {
      postId,
      text: cleanText,
      status: 'pending' as const,
      recaptchaScore: typeof recaptchaScore === 'number' ? recaptchaScore : null,
      ipHash: req.ip ? crypto.createHash('sha256').update(req.ip).digest('hex') : null,
      userAgent: req.headers['user-agent'] || null,
    };

    // Utilizador autenticado
    if (user && user._id && user.name) {
      const comment = await Comment.create({
        ...base,
        userId: user._id,
        userName: user.name,
      });
      return res.status(201).json(comment);
    }

    // Convidado
    if (!guestName || typeof guestName !== 'string' || guestName.trim().length < 2) {
      return res.status(400).json({ message: 'guestName is required for guest comments' });
    }

    const comment = await Comment.create({
      ...base,
      guestName: sanitize(guestName),
      guestEmail: guestEmail ? guestEmail.toString().trim() : null,
      guestWebsite: guestWebsite ? guestWebsite.toString().trim() : null,
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('[Create Comment]', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
};

// Listar comentários aprovados de um post
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId, status: 'approved' }).sort({ createdAt: -1 });
    return res.status(200).json(comments);
  } catch (error) {
    console.error('[Get Comments]', error);
    return res.status(500).json({ error: 'Failed to load comments' });
  }
};

// Apagar comentário
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const authorId = comment.userId?.toString();
    const userId = typeof user._id === 'string' ? user._id : (user._id as any).toString();

    if (authorId !== userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
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
  } catch {
    res.status(500).json({ count: 0 });
  }
};
