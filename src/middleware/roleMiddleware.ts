// The-Human-Tech-Blog-Server/src/middleware/roleMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes((req.user as IUser).role)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
