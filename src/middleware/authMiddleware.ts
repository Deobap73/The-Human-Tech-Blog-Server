// The-Human-Tech-Blog-Server/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
      return; // 👈 evita erro de "not all code paths return"
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return; // 👈 evita erro de "not all code paths return"
    }

    req.user = user;
    return next(); // ✅ caminho seguro
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return; // 👈 evita erro de "not all code paths return"
  }
};
