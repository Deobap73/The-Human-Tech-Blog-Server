// src/middleware/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types/User';

// Keep your existing middleware functions
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as IUser;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }
  next();
};

export const isAdminOrTarget = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as IUser;
  if (!user?._id) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if (user.role === 'admin') {
    return next();
  }
  if (req.params.userId && req.params.userId !== String(user._id)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  next();
};


export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as IUser;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: `Access denied: Only [${roles.join(', ')}] allowed` });
      return;
    }
    next();
  };
};