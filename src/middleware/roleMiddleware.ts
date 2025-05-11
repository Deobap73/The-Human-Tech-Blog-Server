// src/middleware/roleMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types/User';

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as Partial<IUser>; // ou WithId<IUser>
    if (!user || !user.role || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    return next();
  };
};
