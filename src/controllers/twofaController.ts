// src/controllers/twofaController.ts
import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User';
import { IUser } from '../models/User';

export const generateTwoFA = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const secret = speakeasy.generateSecret({ name: `TheHumanTechBlog (${user.email})` });

  await User.findByIdAndUpdate(user._id, {
    twoFactorTempSecret: secret.base32,
  });

  const qrCodeData = await qrcode.toDataURL(secret.otpauth_url!);
  return res.status(200).json({ qrCode: qrCodeData });
};

export const verifyTwoFA = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { token } = req.body;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!token) return res.status(400).json({ message: 'Missing token' });

  const dbUser = await User.findById(user._id);
  if (!dbUser) return res.status(404).json({ message: 'User not found' });

  const verified = speakeasy.totp.verify({
    secret: dbUser.twoFactorTempSecret || '',
    encoding: 'base32',
    token,
  });

  if (!verified) return res.status(403).json({ message: 'Invalid 2FA token' });

  dbUser.twoFactorEnabled = true;
  dbUser.twoFactorSecret = dbUser.twoFactorTempSecret;
  dbUser.twoFactorTempSecret = undefined;
  await dbUser.save();

  return res.status(200).json({ message: '2FA activated' });
};

export const disableTwoFA = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  await User.findByIdAndUpdate(user._id, {
    twoFactorEnabled: false,
    twoFactorSecret: undefined,
    twoFactorTempSecret: undefined,
  });

  return res.status(200).json({ message: '2FA disabled' });
};
