// /src/controllers/userController.ts
import { Request, Response } from 'express';
import Post from '../models/Post';
import Draft from '../models/Draft';
import Bookmark from '../models/Bookmark';
import Comment from '../models/Comment';
import User from '../models/User';
import { uploadImageBuffer } from '../services/cloudinaryService';

// GET /api/users/me
export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.json(req.user);
};

// GET /api/users/me/posts
export const getMyPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// GET /api/users/me/drafts
export const getMyDrafts = async (req: Request, res: Response) => {
  try {
    const drafts = await Draft.find({ author: req.user._id }).sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

// GET /api/users/me/bookmarks
export const getMyBookmarks = async (req: Request, res: Response) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).populate('postId');
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookmarks' });
  }
};

// GET /api/users/me/comments
export const getMyComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const userId = req.user?._id;
  try {
    let avatarUrl: string | undefined = req.body.avatar; // fallback: url da body, legacy

    // Se veio um ficheiro avatar (form-data)
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, `user_${userId}_avatar`);
      avatarUrl = uploadResult.url;
    }

    // Atualiza só campos definidos
    const updateFields: any = { name, email };
    if (avatarUrl) updateFields.avatar = avatarUrl;

    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
      context: 'query',
    }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};
