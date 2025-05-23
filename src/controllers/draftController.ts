// The-Human-Tech-Blog-Server/src/controllers/draftController.ts

import { Request, Response } from 'express';
import Draft from '../models/Draft';
import { IUser } from '../types/User';

// Utility to check if user is author
const isAuthor = (resource: any, userId: string) =>
  resource.author && resource.author.toString() === userId;

// ✅ Create new draft (associated with authenticated user)
export const createDraft = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const draft = await Draft.create({
      ...req.body,
      author: user._id,
    });
    return res.status(201).json({ message: 'Draft created', draft });
  } catch (error) {
    console.error('[Create Draft]', error);
    return res.status(500).json({ message: 'Failed to create draft' });
  }
};

// ✅ Update existing draft (only author can update)
export const updateDraft = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    // Author protection
    if (!isAuthor(draft, String(user._id))) {
      return res.status(403).json({ message: 'Forbidden: not the author' });
    }

    Object.assign(draft, req.body);
    await draft.save();
    return res.status(200).json({ message: 'Draft updated', draft });
  } catch (error) {
    console.error('[Update Draft]', error);
    return res.status(500).json({ message: 'Failed to update draft' });
  }
};

// Get draft by ID (only author or admin can access)
export const getDraftById = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    // Author protection
    if (!isAuthor(draft, String(user._id)) && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not the author' });
    }

    return res.status(200).json(draft);
  } catch (error) {
    console.error('[Get Draft]', error);
    return res.status(500).json({ message: 'Failed to fetch draft' });
  }
};

// Delete draft (only author can delete)
export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    // Author protection
    if (!isAuthor(draft, String(user._id))) {
      return res.status(403).json({ message: 'Forbidden: not the author' });
    }

    await draft.deleteOne();
    return res.status(200).json({ message: 'Draft deleted' });
  } catch (error) {
    console.error('[Delete Draft]', error);
    return res.status(500).json({ message: 'Failed to delete draft' });
  }
};

// ✅ Get all drafts for authenticated user
export const getMyDrafts = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const drafts = await Draft.find({ author: user._id }).sort({ updatedAt: -1 });
    return res.status(200).json(drafts);
  } catch (error) {
    console.error('[Get My Drafts]', error);
    return res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

// ✅ Admin: Get all drafts
export const getAllDrafts = async (_req: Request, res: Response) => {
  try {
    const drafts = await Draft.find().populate('author', 'name email').sort({ updatedAt: -1 });
    return res.status(200).json(drafts);
  } catch (error) {
    console.error('[Get All Drafts]', error);
    return res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

// ✅ Delete all drafts for authenticated user
export const deleteAllMyDrafts = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const result = await Draft.deleteMany({ author: user._id });
    return res.status(200).json({ message: 'All drafts deleted', count: result.deletedCount });
  } catch (error) {
    console.error('[Delete All Drafts]', error);
    return res.status(500).json({ message: 'Failed to delete drafts' });
  }
};
