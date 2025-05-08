// src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import redisClient from '../config/redis';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';

export const handleRegister = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    await User.create({ name, email, password });
    return res.status(201).json({ message: 'User created' });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  await redisClient.set(refreshToken, user._id.toString(), {
    EX: env.REFRESH_TOKEN_EXPIRATION_MS / 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    maxAge: env.REFRESH_TOKEN_EXPIRATION_MS,
  });
  return res.json({ accessToken });
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Missing refresh token' });
  try {
    const { userId } = verifyRefreshToken(token);
    const stored = await redisClient.get(token);
    if (!stored || stored !== userId) {
      return res.status(403).json({ message: 'Refresh token revoked or invalid' });
    }
    const accessToken = signAccessToken(userId);
    return res.json({ accessToken });
  } catch {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const handleLogout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) await redisClient.del(token);
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
  });
  return res.status(200).json({ message: 'Logged out' });
};

export const handleGetMe = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  return res.status(200).json({ user: req.user });
};
