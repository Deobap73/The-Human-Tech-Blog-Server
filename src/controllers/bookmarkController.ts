// src/controllers/bookmarkController.ts

import { Request, Response } from 'express';
import Bookmark from '../models/Bookmark';
import { IUser } from '../types/User';

// Toggle bookmark (add/remove)
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
  } catch (err) {
    console.error('[Toggle Bookmark]', err);
    return res.status(500).json({ error: 'Failed to process bookmark' });
  }
};

// Get all bookmarks for logged-in user
export const getBookmarks = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const bookmarks = await Bookmark.find({ userId: user._id }).populate('postId');
    return res.status(200).json(bookmarks);
  } catch (err) {
    console.error('[Get Bookmarks]', err);
    return res.status(500).json({ error: 'Failed to load bookmarks' });
  }
};

// Delete bookmark via DELETE
export const deleteBookmark = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { postId } = req.params;

  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const existing = await Bookmark.findOne({ postId, userId: user._id });
    if (!existing) return res.status(404).json({ error: 'Bookmark not found' });

    await existing.deleteOne();
    return res.status(200).json({ message: 'Bookmark deleted' });
  } catch (err) {
    console.error('[Delete Bookmark]', err);
    return res.status(500).json({ error: 'Failed to delete bookmark' });
  }
};
