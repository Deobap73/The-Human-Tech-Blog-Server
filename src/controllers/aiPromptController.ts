// src/controllers/aiPromptController.ts
import { Request, Response } from 'express';
import * as aiPromptService from '../services/aiPromptService';

export const getAiPrompts = async (req: Request, res: Response) => {
  try {
    const prompts = await aiPromptService.getAllAiPrompts(req.query);
    return res.status(200).json(prompts);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch AI Prompts' });
  }
};

export const getAiPromptById = async (req: Request, res: Response) => {
  try {
    const prompt = await aiPromptService.getAllAiPrompts({ _id: req.params.id });
    if (!prompt || prompt.length === 0)
      return res.status(404).json({ message: 'AI Prompt not found' });
    return res.status(200).json(prompt[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching AI Prompt' });
  }
};

export const getAiPromptBySlug = async (req: Request, res: Response) => {
  try {
    const prompt = await aiPromptService.getAllAiPrompts({ slug: req.params.slug });
    if (!prompt || prompt.length === 0)
      return res.status(404).json({ message: 'AI Prompt not found' });
    return res.status(200).json(prompt[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching AI Prompt' });
  }
};

export const createAiPrompt = async (req: Request, res: Response) => {
  try {
    const newPrompt = await aiPromptService.createAiPromptDirect(req.user._id, req.body);
    return res.status(201).json({ message: 'AI Prompt created', prompt: newPrompt });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create AI Prompt' });
  }
};

export const updateAiPrompt = async (req: Request, res: Response) => {
  try {
    const updated = await aiPromptService.updateAiPromptDirect(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    if (!updated) return res.status(404).json({ message: 'AI Prompt not found' });
    return res.status(200).json({ message: 'AI Prompt updated', prompt: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(500).json({ message: 'Failed to update AI Prompt' });
  }
};

export const deleteAiPrompt = async (req: Request, res: Response) => {
  try {
    const deleted = await aiPromptService.updateAiPromptDirect(
      req.params.id,
      req.user._id,
      req.user.role,
      { status: 'archived' }
    );
    if (!deleted) return res.status(404).json({ message: 'AI Prompt not found' });
    return res.status(200).json({ message: 'AI Prompt archived' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to archive AI Prompt' });
  }
};
