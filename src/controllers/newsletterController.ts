// src/controllers/newsletterController.ts

import { Request, Response } from 'express';
import NewsletterSubscriber from '../models/NewsletterSubscriber';
import { sendMail } from '../utils/sendMail';
import crypto from 'crypto';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://thehumantechblog.com'; // ajuste conforme necessário

// POST /api/newsletter/subscribe — Public subscribe endpoint
export const subscribeNewsletter = async (req: Request, res: Response) => {
  const { email, language } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    let subscriber = await NewsletterSubscriber.findOne({ email });

    if (subscriber && subscriber.unsubscribed) {
      // Reativar subscrição (reset flags/tokens)
      subscriber.confirmed = false;
      subscriber.unsubscribed = false;
      subscriber.unsubscribedAt = null;
      subscriber.confirmationToken = crypto.randomBytes(32).toString('hex');
      subscriber.unsubscribeToken = crypto.randomBytes(32).toString('hex');
      subscriber.confirmationSentAt = new Date();
      if (language) subscriber.language = language;
      await subscriber.save();
    } else if (subscriber) {
      return res.status(400).json({ message: 'Email already subscribed' });
    } else {
      // Novo subscritor
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');
      subscriber = await NewsletterSubscriber.create({
        email,
        language: language || 'en',
        confirmationToken,
        unsubscribeToken,
        confirmationSentAt: new Date(),
        confirmed: false,
      });
    }

    // Enviar email de confirmação (double opt-in)
    const confirmLink = `${FRONTEND_URL}/newsletter/confirm/${subscriber.confirmationToken}`;
    await sendMail({
      to: subscriber.email,
      subject: 'Confirm your subscription',
      html: `
        <p>Hi,</p>
        <p>Please confirm your newsletter subscription by clicking the link below:</p>
        <a href="${confirmLink}">${confirmLink}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return res.status(201).json({ message: 'Confirmation email sent. Please check your inbox.' });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return res.status(500).json({ message: 'Subscription failed' });
  }
};

// GET /api/newsletter/confirm/:token — Confirm subscription (user clicks link)
export const confirmNewsletter = async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    const subscriber = await NewsletterSubscriber.findOne({
      confirmationToken: token,
      confirmed: false,
    });
    if (!subscriber) {
      return res.status(400).json({ message: 'Invalid or expired confirmation token.' });
    }
    subscriber.confirmed = true;
    subscriber.confirmationToken = null;
    await subscriber.save();
    // Pode redirecionar para página de sucesso no frontend, se desejar
    return res.status(200).json({ message: 'Subscription confirmed!' });
  } catch (err) {
    return res.status(500).json({ message: 'Confirmation failed' });
  }
};

// POST /api/newsletter/unsubscribe/:token — Unsubscribe (user clicks link)
export const unsubscribeNewsletter = async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    const subscriber = await NewsletterSubscriber.findOne({
      unsubscribeToken: token,
      unsubscribed: false,
    });
    if (!subscriber) {
      return res.status(400).json({ message: 'Invalid or expired unsubscribe token.' });
    }
    subscriber.unsubscribed = true;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
    // Pode redirecionar para página de sucesso no frontend, se desejar
    return res.status(200).json({ message: 'Unsubscribed successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Unsubscribe failed' });
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
