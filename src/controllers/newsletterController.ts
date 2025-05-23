// src/controllers/newsletterController.ts

import { Request, Response } from 'express';
import NewsletterSubscriber from '../models/NewsletterSubscriber';

// POST /api/newsletter/subscribe — Public subscribe endpoint
export const subscribeNewsletter = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    await NewsletterSubscriber.create({ email });
    return res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Subscription failed' });
  }
};

// GET /api/newsletter/subscribers — List all subscribers (admin only)
export const listSubscribers = async (_req: Request, res: Response) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    return res.status(200).json(subscribers);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load subscribers' });
  }
};
