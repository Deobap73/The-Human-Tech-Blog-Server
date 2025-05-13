// src/socket/middleware/authMiddleware.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import User from '@/models/User';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication token missing'));

  try {
    const decoded: any = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));

    socket.data.user = user;
    return next();
  } catch (err) {
    return next(new Error('Authentication failed'));
  }
};
