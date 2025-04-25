// The-Human-Tech-Blog-Server/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
  userId: string;
  role: string;
}

// Middleware para proteger rotas
// Middleware para proteger rotas
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Busca o usuário no banco de dados
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user; // Agora 'user' é reconhecido pelo TypeScript
    next();
  } catch (error) {
    console.error('[Auth Middleware]', error);
    return res.status(401).json({ message: 'Token is not valid or expired' });
  }
};
