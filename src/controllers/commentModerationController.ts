// The-Human-Tech-Blog-Server/src/controllers/commentModerationController.ts

import { Request, Response } from 'express';
import Comment from '../models/Comment';

// Listar comentários pendentes
export const listPendingComments = async (_req: Request, res: Response) => {
  const comments = await Comment.find({ status: 'pending' }).populate(
    'postId userId',
    'title name'
  );
  return res.json(comments);
};

// Aprovar comentário
export const approveComment = async (req: Request, res: Response) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', moderatedBy: req.user._id },
    { new: true }
  );
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  return res.json(comment);
};

// Rejeitar comentário
export const rejectComment = async (req: Request, res: Response) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', moderatedBy: req.user._id },
    { new: true }
  );
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  return res.json(comment);
};
