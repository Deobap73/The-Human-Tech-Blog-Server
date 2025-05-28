// The-Human-Tech-Blog-Server/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { env } from '../config/env';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const authHeader = req.headers.authorization;
  console.log('Authentication middleware triggered');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('No token provided in authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted JWT token from header');

  try {
    console.log('Verifying JWT token');
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };

    console.log('Looking up user in database', { userId: decoded.id });
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.warn('User not found for valid JWT', { userId: decoded.id });
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('Authentication successful', { userId: user._id });
    req.user = user;
    return next();
  } catch (err) {
    console.error('JWT verification failed', { error: err, token });
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAuthenticated = protect;
