import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; // <- Corrigido aqui também!

interface JwtPayload {
  userId: string;
  role: string;
}

// Middleware para proteger rotas
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user as IUser; // <- Forçar tipagem segura
    return next();
  } catch (error) {
    console.error('[Auth Middleware]', error);
    return res.status(401).json({ message: 'Token is not valid or expired' });
  }
};
