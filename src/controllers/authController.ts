// src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import redisClient from '../config/redis';
import { env } from '../config/env';
import { issueTokens } from '../utils/issueTokens';

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

  const { accessToken } = await issueTokens(user._id.toString(), res);

  return res.json({ accessToken });
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  const oldToken = req.cookies.refreshToken;

  if (!oldToken) return res.status(401).json({ message: 'Missing refresh token' });

  const userId = await redisClient.get(oldToken);
  if (!userId) return res.status(403).json({ message: 'Refresh token revoked or invalid' });

  await redisClient.del(oldToken);

  const { accessToken } = await issueTokens(userId, res);

  return res.json({ accessToken });
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
