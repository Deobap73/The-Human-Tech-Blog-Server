// src/controllers/notificationController.ts

import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { IUser } from '../types/User';

// GET notifications for logged-in user
export const getNotifications = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const notifications = await Notification.find({ user: `${user._id}` }).sort({
      createdAt: -1,
    });
    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// PATCH mark as read
export const markNotificationRead = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: `${user._id}` },
      { isRead: true },
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

// DELETE notification
export const deleteNotification = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: `${user._id}`,
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// POST create notification (para exemplo, normalmente backend chama internamente)
export const createNotification = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { message, type } = req.body;
  try {
    const notification = await Notification.create({
      user: `${user._id}`,
      message,
      type,
      isRead: false,
    });
    return res.status(201).json(notification);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create notification' });
  }
};
