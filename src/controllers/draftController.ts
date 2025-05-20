// The-Human-Tech-Blog-Server/src/controllers/draftController.ts

import { Request, Response } from 'express';
import Draft from '../models/Draft';
import { IUser } from '../types/User';

// ✅ Criar novo rascunho (associado ao utilizador autenticado)
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

// ✅ Atualizar rascunho existente
export const updateDraft = async (req: Request, res: Response) => {
  try {
    const updated = await Draft.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Draft not found' });
    return res.status(200).json({ message: 'Draft updated', draft: updated });
  } catch (error) {
    console.error('[Update Draft]', error);
    return res.status(500).json({ message: 'Failed to update draft' });
  }
};

// ✅ Obter rascunho por ID
export const getDraftById = async (req: Request, res: Response) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    return res.status(200).json(draft);
  } catch (error) {
    console.error('[Get Draft]', error);
    return res.status(500).json({ message: 'Failed to fetch draft' });
  }
};

// ✅ Eliminar rascunho
export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const deleted = await Draft.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Draft not found' });
    return res.status(200).json({ message: 'Draft deleted' });
  } catch (error) {
    console.error('[Delete Draft]', error);
    return res.status(500).json({ message: 'Failed to delete draft' });
  }
};

// ✅ Obter todos os rascunhos do utilizador autenticado
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

// ✅ Admin: Obter todos os rascunhos
export const getAllDrafts = async (_req: Request, res: Response) => {
  try {
    const drafts = await Draft.find().populate('author', 'name email').sort({ updatedAt: -1 });
    return res.status(200).json(drafts);
  } catch (error) {
    console.error('[Get All Drafts]', error);
    return res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

// ✅ Eliminar todos os rascunho
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
