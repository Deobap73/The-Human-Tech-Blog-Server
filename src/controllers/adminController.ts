// ✅ The-Human-Tech-Blog-Server/src/controllers/adminController.ts
import { Request, Response } from 'express';
import User, { UserDoc } from '../models/User';
import redisClient from '../config/redis';
import { env } from '../config/env';
import { issueTokens } from '../utils/issueTokens';
import speakeasy from 'speakeasy';
import { UserActionLog } from '../models/UserActionLog';

export const handleRegister = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  console.log('Admin registration attempt', { email, name });

  try {
    console.log('Checking for existing user with email', { email });
    const existing = await User.findOne({ email });

    if (existing) {
      console.warn('Registration failed - email already in use', { email });
      return res.status(400).json({ message: 'Email already in use' });
    }

    console.log('Creating new admin user', { email, name });
    await User.create({ name, email, password });

    console.log('Admin user created successfully', { email, name });
    return res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Admin registration failed', { error: err, email, name });
    return res.status(500).json({ message: 'Registration failed' });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;
  console.log('Admin login attempt', { email });

  try {
    console.log('Looking up user in database', { email });
    const user = (await User.findOne({ email }).select('+password')) as UserDoc;

    if (!user || !(await user.comparePassword(password))) {
      console.warn('Invalid credentials provided', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'admin' && user.twoFactorEnabled) {
      console.log('2FA check required for admin user', { userId: user._id });

      if (!token) {
        console.warn('2FA token missing for admin login', { userId: user._id });
        return res.status(401).json({ message: '2FA token required' });
      }

      console.log('Verifying 2FA token', { userId: user._id });
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token,
      });

      if (!verified) {
        console.warn('Invalid 2FA token provided', { userId: user._id });
        return res.status(401).json({ message: 'Invalid 2FA token' });
      }
    }

    console.log('Issuing tokens for user', { userId: user._id });
    const { accessToken } = await issueTokens(user._id.toString(), res);

    console.log('Admin login successful', { userId: user._id });
    return res.json({ accessToken });
  } catch (err) {
    console.error('Admin login failed', { error: err, email });
    return res.status(500).json({ message: 'Login failed' });
  }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  const oldToken = req.cookies.refreshToken;
  console.log('Refresh token request received');

  if (!oldToken) {
    console.warn('Refresh token missing in request');
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  try {
    console.log('Checking Redis for refresh token validity', { token: oldToken });
    const userId = await redisClient.get(oldToken);

    if (!userId) {
      console.warn('Refresh token not found in Redis or invalid', { token: oldToken });
      return res.status(403).json({ message: 'Refresh token revoked or invalid' });
    }

    console.log('Deleting old refresh token from Redis', { token: oldToken });
    await redisClient.del(oldToken);

    console.log('Issuing new tokens', { userId });
    const { accessToken } = await issueTokens(userId, res);

    console.log('Token refresh successful', { userId });
    return res.json({ accessToken });
  } catch (err) {
    console.error('Token refresh failed', { error: err, token: oldToken });
    return res.status(500).json({ message: 'Token refresh failed' });
  }
};

export const handleLogout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  console.log('Logout request received');

  try {
    if (token) {
      console.log('Revoking refresh token in Redis', { token });
      await redisClient.del(token);
    }

    console.log('Clearing refreshToken cookie');
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
    });

    console.log('Logout successful');
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout failed', { error: err });
    return res.status(500).json({ message: 'Logout failed' });
  }
};

export const handleGetMe = async (req: Request, res: Response) => {
  console.log('GetMe request received');

  if (!req.user) {
    console.warn('Unauthorized GetMe request - no user in request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log('GetMe request successful', { userId: req.user._id });
  return res.status(200).json({ user: req.user });
};

export const getAdminDashboard = (req: Request, res: Response) => {
  const user = req.user;
  console.log('Admin dashboard accessed', { userId: user?._id });

  return res.status(200).json({
    message: 'Admin dashboard data',
    user,
  });
};

export const getStats = async (_req: Request, res: Response) => {
  console.log('Admin stats request received');

  try {
    console.log('Fetching statistics from database');
    const [users, posts, drafts, comments] = await Promise.all([
      User.countDocuments(),
      require('../models/Post').default.countDocuments(),
      require('../models/Draft').default.countDocuments(),
      require('../models/Comment').default.countDocuments(),
    ]);

    console.log('Statistics retrieved successfully', {
      users,
      posts,
      drafts,
      comments,
    });

    return res.status(200).json({
      totalUsers: users,
      totalPosts: posts,
      totalDrafts: drafts,
      totalComments: comments,
    });
  } catch (err) {
    console.error('Failed to load statistics', { error: err });
    return res.status(500).json({ message: 'Failed to load stats' });
  }
};

export const getAdminLogs = async (_req: Request, res: Response) => {
  console.log('Admin logs request received');

  try {
    console.log('Fetching admin logs from database');
    const logs = await UserActionLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    console.log('Admin logs retrieved successfully', { count: logs.length });
    return res.status(200).json(logs);
  } catch (err) {
    console.error('Failed to load admin logs', { error: err });
    return res.status(500).json({ message: 'Failed to load logs' });
  }
};
