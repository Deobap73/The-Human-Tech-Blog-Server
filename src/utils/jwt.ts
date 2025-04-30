// The-Human-Tech-Blog-Server/src/utils/jwt.ts

import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Types } from 'mongoose';

interface TokenPayload {
  userId: Types.ObjectId;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  // Convertemos ObjectId para string apenas para o JWT
  const payloadForJwt = {
    userId: payload.userId.toString(),
    role: payload.role,
  };

  return jwt.sign(payloadForJwt, env.JWT_SECRET, {
    expiresIn: env.isProduction ? '1h' : '7d',
    issuer: 'the-human-tech-blog',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };

  // Convertemos de volta para ObjectId
  return {
    userId: new Types.ObjectId(decoded.userId),
    role: decoded.role,
  };
};
