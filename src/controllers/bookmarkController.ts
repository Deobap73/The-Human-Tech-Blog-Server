// The-Human-Tech-Blog-Server/src/controllers/bookmarkController.ts

import { Request, Response } from 'express';
/* import mongoose from 'mongoose'; */
import Bookmark from '../models/Bookmark';
import { IUser } from '../types/User';

export const toggleBookmark = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { postId } = req.body;

  try {
    const existing = await Bookmark.findOne({ postId, userId: user._id });
    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ message: 'Bookmark removed' });
    } else {
      await Bookmark.create({ postId, userId: user._id });
      return res.status(201).json({ message: 'Bookmark added' });
    }
  } catch {
    return res.status(500).json({ error: 'Failed to process bookmark' });
  }
};

export const getBookmarks = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const bookmarks = await Bookmark.find({ userId: user._id }).populate('postId');
    return res.status(200).json(bookmarks);
  } catch {
    return res.status(500).json({ error: 'Failed to load bookmarks' });
  }
};
