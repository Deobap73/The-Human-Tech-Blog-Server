// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import User from '../models/User';
import { issueTokens } from '../utils/issueTokens';
import { env } from '../config/env';
import { IUser } from '../types/User';
import { WithId } from '../types/WithId';

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const typedUser = user as WithId<IUser>;

  if (typedUser.role === 'admin' && typedUser.twoFactorEnabled) {
    if (!token) {
      return res.status(401).json({ message: '2FA token required', twoFactorRequired: true });
    }

    const verified = speakeasy.totp.verify({
      secret: typedUser.twoFactorSecret!,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }
  }

  const { accessToken, refreshToken } = await issueTokens(typedUser._id.toString(), res);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ accessToken });
};

export const handleRegister = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await User.create({ name, email, password: hashedPassword });

  return res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
};

export const handleLogout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/api/auth/refresh',
  });
  return res.status(200).json({ message: 'Logout success' });
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    console.log('📥 Incoming /refresh request');
    console.log('🧁 Cookies:', req.cookies);

    const token = req.cookies?.refreshToken;
    if (!token) {
      console.warn('🚫 No refresh token found in cookies');
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id: string };
    console.log('🧬 Decoded JWT payload:', decoded);

    const user = await User.findById(decoded.id);
    if (!user || !user._id) {
      console.warn('❌ User not found in DB:', decoded.id);
      return res.status(404).json({ message: 'User not found' });
    }

    const { accessToken, refreshToken: newRefresh } = await issueTokens(user._id.toString(), res);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (error: any) {
    console.error('💥 Refresh error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return res.status(500).json({
      message: 'Internal server error during refresh',
      error: env.isProduction ? undefined : error.message,
    });
  }
};

export const handleGetMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

export const handleToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as { id: string };
    const user = await User.findById(payload.id);

    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = jwt.sign({ id: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRATION,
    } as SignOptions);

    return res.json({ accessToken });
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};
