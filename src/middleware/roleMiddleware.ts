// The-Human-Tech-Blog-Server/src/middleware/roleMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = req.user as IUser;

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized for this role' });
    }

    return next(); // <-- sempre return para TS ficar feliz
  };
};
