// src/utils/notifyUser.ts

import Notification from '../models/Notification';

export const notifyUser = async ({
  userId,
  type,
  message,
  data = {},
}: {
  userId: string;
  type: 'comment' | 'post' | 'admin' | 'system';
  message: string;
  data?: Record<string, any>;
}) => {
  try {
    await Notification.create({
      user: userId,
      type,
      message,
      data,
      isRead: false,
    });
  } catch (error) {
    console.error('[notifyUser]', error);
  }
};
