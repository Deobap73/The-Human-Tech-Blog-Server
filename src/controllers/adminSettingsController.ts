// The-Human-Tech-Blog-Server/src/controllers/adminSettingsController.ts
import { Request, Response } from 'express';
import AdminSettings from '../models/AdminSettings';

// Get settings
export const getSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load settings' });
  }
};

// Update settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = await AdminSettings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
};
