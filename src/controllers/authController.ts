// The-Human-Tech-Blog-Server/src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { issueTokens } from '../utils/issueTokens';
import { env } from '../config/env';
import type { CookieOptions } from 'express';

/**
 * Returns secure and robust cookie options for session (refresh token) cookies.
 * Ensures cross-subdomain compatibility, HTTPOnly, and correct sameSite/security settings.
 * If `isClear` is true, omits maxAge (for clearCookie).
 */
const getCookieOptions = (isClear = false): CookieOptions => ({
  httpOnly: true,
  sameSite: env.isProduction ? 'none' : 'lax', // must be typed as literal, not string
  secure: env.isProduction,
  domain: env.isProduction ? '.thehumantechblog.com' : undefined,
  path: '/',
  ...(isClear ? {} : { maxAge: env.REFRESH_TOKEN_EXPIRATION_MS }),
});

/**
 * Login with optional 2FA (for admin).
 * Issues access and refresh tokens, sets secure refresh token cookie.
 */
export const login = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;
  console.log('Login attempt', { email });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Two-Factor Authentication for admins
    if (user.role === 'admin' && user.twoFactorEnabled) {
      if (!token) {
        return res.status(401).json({
          message: '2FA token required',
          twoFactorRequired: true,
        });
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

    // Set secure refreshToken cookie (cross-subdomain, httpOnly)
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());

    return res.status(200).json({
      accessToken: tokens.accessToken,
      message: 'Login successful',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Login failed',
      error: (err as Error).message,
    });
  }
};

/**
 * Register new user (basic, no auto-login).
 */
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({
      message: 'Registration failed',
      error: (err as Error).message,
    });
  }
};

/**
 * Logout user: clear refreshToken (and XSRF-TOKEN) cookies.
 * Uses robust cross-subdomain settings.
 */
export const logout = async (req: Request, res: Response) => {
  try {
    console.log('[authController:logout] Called', {
      cookies: req.cookies,
      headers: req.headers,
    });
    res.clearCookie('refreshToken', getCookieOptions(true));
    res.clearCookie('XSRF-TOKEN', {
      httpOnly: false,
      sameSite: env.isProduction ? 'none' : 'lax',
      secure: env.isProduction,
      domain: env.isProduction ? '.thehumantechblog.com' : undefined,
      path: '/',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({
      message: 'Logout failed',
      error: (err as Error).message,
    });
  }
};

/**
 * Refresh session: validate refreshToken, re-issue tokens, and update cookie.
 * Fails gracefully if token is invalid/expired.
 */
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    console.warn('[refreshToken] No refresh token found in cookies. Returning 401.');
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id: string };

    console.log(`[refreshToken] Refresh token verified for user ID: ${decoded.id}`);

    // Re-issue tokens
    const tokens = await issueTokens(decoded.id, res);

    // Set new refreshToken cookie (cross-subdomain)
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());

    console.log('[refreshToken] New access token issued.');
    return res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error('[refreshToken] Invalid refresh token:', (error as Error).message);
    // Clear the invalid refresh token cookie to prevent further attempts
    res.clearCookie('refreshToken', getCookieOptions(true));
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

/**
 * Get current user (after JWT validation).
 */
export const getMe = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    console.warn('[getMe] No user found in request after protection. Returning 401.');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({ user });
};
