// The-Human-Tech-Blog-Server/src/controllers/twofaController.ts

import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { IUser } from '../types/User';

export const generate2FA = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can enable 2FA' });
  }

  try {
    const secret = speakeasy.generateSecret({ name: `HumanTechBlog (${user.email})` });

    if (!secret.otpauth_url) {
      return res.status(500).json({ message: 'Failed to generate OTP Auth URL' });
    }

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    await user.save();

    return res.status(200).json({ qrCode, secret: secret.base32 });
  } catch (error) {
    console.error('[2FA Generate]', error);
    return res.status(500).json({ message: 'Failed to generate 2FA' });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '2FA token required' });
  }

  if (!user.twoFactorSecret) {
    return res.status(400).json({ message: 'No 2FA secret found for user' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!verified) {
    return res.status(401).json({ message: 'Invalid 2FA token' });
  }

  user.twoFactorEnabled = true;
  await user.save();

  return res.status(200).json({ message: '2FA enabled successfully' });
};

export const disable2FA = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can disable 2FA' });
  }

  user.twoFactorSecret = undefined;
  user.twoFactorEnabled = false;
  await user.save();

  return res.status(200).json({ message: '2FA disabled' });
};
