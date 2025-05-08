// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const ACCESS_SECRET = env.JWT_SECRET;
const REFRESH_SECRET = env.JWT_SECRET + '_refresh';

export const signAccessToken = (userId: string) => {
  return jwt.sign({ userId: userId.toString() }, ACCESS_SECRET, { expiresIn: '15m' });
};

export const signRefreshToken = (userId: string) => {
  return jwt.sign({ userId: userId.toString() }, REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string };
};
