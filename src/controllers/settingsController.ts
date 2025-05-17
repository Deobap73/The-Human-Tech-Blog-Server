// src/controllers/settingsController.ts

import { Request, Response } from 'express';

export const getAdminSettings = async (_req: Request, res: Response) => {
  res.json({
    siteTitle: 'The Human Tech Blog',
    enableChat: true,
    maxUsers: 100,
  });
};

export const updateAdminSettings = async (req: Request, res: Response) => {
  // Simula atualização
  res.json({ success: true, updated: req.body });
};
