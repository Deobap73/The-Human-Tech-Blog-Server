// src/controllers/notificationController.ts

import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { IUser } from '../types/User';

export const getNotifications = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const notifications = await Notification.find({ user: user._id }).sort({ createdAt: -1 });
    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { id } = req.params;
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    return res.status(200).json(notification);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update notification' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    await Notification.updateMany({ user: user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update notifications' });
  }
};
