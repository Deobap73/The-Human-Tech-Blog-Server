// The-Human-Tech-Blog-Server/src/controllers/userController.ts
'use strict';

import { Request, Response } from 'express';
import Post from '../models/Post';
import Draft from '../models/Draft';
import Bookmark from '../models/Bookmark';
import Comment from '../models/Comment';
import User from '../models/User';
import { uploadImageBuffer } from '../services/cloudinaryService';

export const getMe = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.json(req.user);
};

export const getMyPosts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    return res.json(posts);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const getMyDrafts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const drafts = await Draft.find({ author: req.user._id }).sort({ updatedAt: -1 });
    return res.json(drafts);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

export const getMyBookmarks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).populate('postId');
    return res.json(bookmarks);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch bookmarks' });
  }
};

export const getMyComments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const comments = await Comment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(comments);
  } catch {
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<Response> => {
  const { name, email } = req.body as { name?: string; email?: string };
  const userId = req.user?._id;

  try {
    let avatarUrl: string | undefined =
      typeof req.body?.avatar === 'string' ? req.body.avatar : undefined;

    if (req.file) {
      const uploadResult = await uploadImageBuffer(
        req.file.buffer,
        `user_${String(userId)}_avatar`
      );
      avatarUrl = uploadResult.url;
    }

    const updateFields: Record<string, unknown> = {};
    if (typeof name === 'string') updateFields.name = name;
    if (typeof email === 'string') updateFields.email = email;
    if (avatarUrl) updateFields.avatar = avatarUrl;

    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
      context: 'query',
    }).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user });
  } catch {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.find({}).select('name _id avatar role').lean();
    return res.status(200).json(users);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};
