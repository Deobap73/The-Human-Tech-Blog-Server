// ✅ The-Human-Tech-Blog-Server/src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User';
import { issueTokens } from '../utils/issueTokens';
import { IUser } from '../types/User';
import { WithId } from '../types/WithId';
import { env } from '../config/env';

export const login = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const typedUser = user as WithId<IUser>;

  // 🔐 Verifica se user admin tem 2FA ativado
  if (typedUser.role === 'admin' && typedUser.twoFactorEnabled) {
    if (!token) {
      return res.status(401).json({ message: '2FA token required', twoFactorRequired: true });
    }

    const verified = speakeasy.totp.verify({
      secret: typedUser.twoFactorSecret || '',
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }
  }

  const tokens = await issueTokens(typedUser._id.toString(), res);

  res.cookie('XSRF-TOKEN', tokens.accessToken, {
    sameSite: 'lax',
    secure: env.isProduction,
    httpOnly: false,
    maxAge: 1000 * 60 * 60, // 1h
  });

  return res.status(200).json({ message: 'Login successful' });
};

export const enable2FA = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can enable 2FA' });
  }

  const secret = speakeasy.generateSecret({ name: `HumanTechBlog (${user.email})` });

  if (!secret.otpauth_url) {
    return res.status(500).json({ message: 'Failed to generate OTP Auth URL' });
  }

  const qr = await qrcode.toDataURL(secret.otpauth_url);

  user.twoFactorSecret = secret.base32;
  user.twoFactorEnabled = false;
  await user.save();

  return res.status(200).json({ qr, secret: secret.base32 });
};

export const verify2FA = async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = req.user as IUser;

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret || '',
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!verified) {
    return res.status(400).json({ message: 'Invalid 2FA token' });
  }

  user.twoFactorEnabled = true;
  await user.save();

  return res.status(200).json({ message: '2FA enabled successfully' });
};

export const disable2FA = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  user.twoFactorSecret = undefined;
  user.twoFactorEnabled = false;
  await user.save();

  return res.status(200).json({ message: '2FA disabled' });
};
