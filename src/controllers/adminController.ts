// src/controllers/adminController.ts
import { Request, Response } from 'express';
import User, { UserDoc } from '../models/User';
import { env } from '../config/env';
import { issueTokens } from '../utils/issueTokens';
import speakeasy from 'speakeasy';
import { UserActionLog } from '../models/UserActionLog';
import TokenBlacklist from '../models/TokenBlacklist';

export const handleRegister = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    await User.create({ name, email, password });
    return res.status(201).json({ message: 'User created' });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;
  try {
    const user = (await User.findOne({ email }).select('+password')) as UserDoc;
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'admin' && user.twoFactorEnabled) {
      if (!token) {
        return res.status(401).json({ message: '2FA token required' });
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token,
      });
      if (!verified) {
        return res.status(401).json({ message: 'Invalid 2FA token' });
      }
    }

    const { accessToken } = await issueTokens(user._id.toString(), res);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  const oldToken = req.cookies.refreshToken;
  if (!oldToken) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }
  try {
    // Verifica se está na blacklist!
    const blacklisted = await TokenBlacklist.findOne({ token: oldToken });
    if (blacklisted) {
      return res.status(403).json({ message: 'Refresh token revoked or invalid' });
    }
    const { id } = require('../utils/jwt').verifyRefreshToken(oldToken);
    const { accessToken } = await issueTokens(id, res);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Refresh token revoked or invalid' });
  }
};

export const handleLogout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  try {
    if (token) {
      // Adiciona o token à blacklist com data de expiração igual ao JWT
      const { exp } = require('../utils/jwt').decodeJWT(token) as { exp: number };
      if (exp) {
        await TokenBlacklist.create({
          token,
          expiresAt: new Date(exp * 1000), // JWT exp é em segundos, JS Date usa ms
        });
      }
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
    });
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    return res.status(500).json({ message: 'Logout failed' });
  }
};

export const handleGetMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.status(200).json({ user: req.user });
};

export const getAdminDashboard = (req: Request, res: Response) => {
  const user = req.user;
  return res.status(200).json({
    message: 'Admin dashboard data',
    user,
  });
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [users, posts, drafts, comments] = await Promise.all([
      User.countDocuments(),
      require('../models/Post').default.countDocuments(),
      require('../models/Draft').default.countDocuments(),
      require('../models/Comment').default.countDocuments(),
    ]);
    return res.status(200).json({
      totalUsers: users,
      totalPosts: posts,
      totalDrafts: drafts,
      totalComments: comments,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load stats' });
  }
};

export const getAdminLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await UserActionLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load logs' });
  }
};
