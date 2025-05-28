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
  console.log('Login attempt', { email });

  try {
    console.log('Looking up user in database', { email });
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.warn('Invalid credentials provided', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'admin' && user.twoFactorEnabled) {
      console.log('2FA check required for admin user', { userId: user._id });

      if (!token) {
        console.warn('2FA token missing for admin login', { userId: user._id });
        return res.status(401).json({
          message: '2FA token required',
          twoFactorRequired: true,
        });
      }

      console.log('Verifying 2FA token', { userId: user._id });
      const speakeasy = await import('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        console.warn('Invalid 2FA token provided', { userId: user._id });
        return res.status(401).json({ message: 'Invalid 2FA token' });
      }
    }

    console.log('Issuing tokens for user', { userId: user._id });
    const tokens = await issueTokens(user._id.toString(), res);

    console.log('Setting XSRF-TOKEN cookie', { userId: user._id });
    res.cookie('XSRF-TOKEN', tokens.accessToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    console.log('Login successful', { userId: user._id });
    return res.status(200).json({
      accessToken: tokens.accessToken,
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login failed', { error: err, email });
    return res.status(500).json({
      message: 'Login failed',
      error: (err as Error).message,
    });
  }
};

// 📥 Registo
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  console.log('Registration attempt', { email, name });

  try {
    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('Checking for existing user', { email });
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.warn('Registration failed - email already in use', { email });
      return res.status(400).json({ message: 'Email already in use' });
    }

    console.log('Creating new user', { email, name });
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    console.log('User registered successfully', { userId: newUser._id });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration failed', { error: err, email, name });
    return res.status(500).json({
      message: 'Registration failed',
      error: (err as Error).message,
    });
  }
};

// 🔐 Logout
export const logout = async (_req: Request, res: Response) => {
  console.log('Logout request received');

  try {
    console.log('Clearing authentication cookies');
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

    console.log('Logout successful');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout failed', { error: err });
    return res.status(500).json({
      message: 'Logout failed',
      error: (err as Error).message,
    });
  }
};

// 🔄 Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  console.log('Refresh token request received');

  if (!token) {
    console.warn('No refresh token provided');
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    console.log('Verifying refresh token', { token });
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id: string };

    console.log('Issuing new tokens', { userId: decoded.id });
    const tokens = await issueTokens(decoded.id, res);

    console.log('Setting new XSRF-TOKEN cookie', { userId: decoded.id });
    res.cookie('XSRF-TOKEN', tokens.accessToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    console.log('Token refresh successful', { userId: decoded.id });
    return res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error('Invalid refresh token', { error, token });
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// 👤 Obter utilizador atual
export const getMe = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  console.log('GetMe request received');

  if (!user) {
    console.warn('Unauthorized GetMe request - no user in request');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log('GetMe request successful', { userId: user._id });
  return res.status(200).json({ user });
};
