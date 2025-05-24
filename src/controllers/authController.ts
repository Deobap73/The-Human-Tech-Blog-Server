import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { issueTokens } from '../utils/issueTokens';
import { IUser } from '../types/User';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

// 🔐 Login com suporte a 2FA (se aplicável)
export const login = async (req: Request, res: Response) => {
  try {
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

    const tokens = await issueTokens(user._id.toString(), res);

    // Access token no header, refreshToken no cookie, xsrf-token cookie para frontend
    res.cookie('XSRF-TOKEN', tokens.accessToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken: tokens.accessToken,
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed', error: (err as Error).message });
  }
};

// 📥 Registo
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: (err as Error).message });
  }
};

// 🔐 Logout
export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: env.isProduction,
    });
    res.clearCookie('XSRF-TOKEN', {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Logout failed', error: (err as Error).message });
  }
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
