// src/controllers/notificationController.ts

import { Request, Response } from 'express';
import Notification, { INotification, NotificationTranslation } from '../models/Notification';
import { IUser } from '../types/User';

// Util to get notification translation with fallback
function getNotificationTranslation(
  translations: INotification['translations'],
  lang: string
): NotificationTranslation | null {
  if (!translations) return null;
  const t = translations[lang];
  if (t && t.title && t.message) return t;
  const fallback = translations['en'];
  return fallback && fallback.title && fallback.message ? fallback : null;
}

// GET /notifications
export const getNotifications = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const lang = (req as any).lang || 'en';
  try {
    const notifications = await Notification.find({ user: user._id }).sort({ createdAt: -1 });
    const result = notifications.map((notif: INotification) => ({
      id: notif._id,
      type: notif.type,
      meta: notif.meta,
      read: notif.read,
      translation: getNotificationTranslation(notif.translations, lang),
      createdAt: notif.createdAt,
    }));
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// PATCH /notifications/:id/read
export const markNotificationRead = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.status(200).json(notification);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update notification' });
  }
};

// DELETE /notifications/:id
export const deleteNotification = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: user._id,
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// POST /notifications (normally only for internal/admin use)
export const createNotification = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { translations, type, meta } = req.body;
  try {
    const notification = await Notification.create({
      user: user._id,
      type,
      meta,
      read: false,
      translations,
    });
    return res.status(201).json(notification);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create notification' });
  }
};
