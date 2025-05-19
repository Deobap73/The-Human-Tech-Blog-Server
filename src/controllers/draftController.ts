// src/controllers/draftController.ts

import { Request, Response } from 'express';
import Draft from '../models/Draft';
import { IUser } from '../models/User';

export const createDraft = async (req: Request, res: Response) => {
  try {
    const draft = await Draft.create({
      ...req.body,
      author: (req.user as IUser)._id,
    });
    return res.status(201).json({ draft });
  } catch (error) {
    console.error('[Create Draft]', error);
    return res.status(500).json({ message: 'Failed to create draft' });
  }
};

export const updateDraft = async (req: Request, res: Response) => {
  try {
    const draft = await Draft.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    return res.status(200).json({ draft });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update draft' });
  }
};

export const getDraftById = async (req: Request, res: Response) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    return res.status(200).json({ draft });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch draft' });
  }
};

export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const result = await Draft.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Draft not found' });
    return res.status(200).json({ message: 'Draft deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete draft' });
  }
};
