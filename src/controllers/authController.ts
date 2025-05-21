// The-Human-Tech-Blog-Server/src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { issueTokens } from '../utils/issueTokens';
import { IUser } from '../types/User';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

// 🔐 Login com suporte a 2FA (se aplicável)
export const login = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.role === 'admin' && user.twoFactorEnabled) {
    if (!token) {
      return res.status(401).json({ message: '2FA token required', twoFactorRequired: true });
    }

    const speakeasy = await import('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret || '',
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }
  }

  const tokens = await issueTokens(user._id as unknown as string, res);

  res.cookie('XSRF-TOKEN', tokens.accessToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: env.isProduction,
    maxAge: 60 * 60 * 1000,
  });

  return res.status(200).json({ message: 'Login successful' });
};

// 📥 Registo
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'Email already in use' });

  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  return res.status(201).json({ message: 'User registered successfully' });
};

// 🔐 Logout
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully' });
};

// 🔄 Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id: string };
    const tokens = await issueTokens(decoded.id, res);

    res.cookie('XSRF-TOKEN', tokens.accessToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// 👤 Obter utilizador atual
export const getMe = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  return res.status(200).json({ user });
};
