// src/controllers/twofaController.ts

import { Request, Response } from 'express';
import User from '../models/User';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const generate2FASecret = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    const secret = speakeasy.generateSecret({
      name: `TheHumanTechBlog:${user.email}`,
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate 2FA secret URL');
    }

    // Store temp secret
    await User.findByIdAndUpdate(user._id, {
      twoFactorTempSecret: secret.base32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return res.status(200).json({
      qrCode,
      secret: secret.base32,
    });
  } catch (error) {
    console.error('2FA generation error:', error);
    return res.status(500).json({ message: 'Error generating 2FA secret' });
  }
};

export const verify2FAToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const user = req.user as any;

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verified = speakeasy.totp.verify({
      secret: userDoc.twoFactorTempSecret || '',
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Save the secret and enable 2FA
    userDoc.twoFactorSecret = userDoc.twoFactorTempSecret;
    userDoc.twoFactorEnabled = true;
    userDoc.twoFactorTempSecret = undefined;
    await userDoc.save();

    return res.status(200).json({ message: '2FA activated' });
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ message: 'Error verifying 2FA token' });
  }
};

export const disable2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    await User.findByIdAndUpdate(user._id, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      twoFactorTempSecret: undefined,
    });

    return res.status(200).json({ message: '2FA disabled' });
  } catch (error) {
    console.error('2FA disable error:', error);
    return res.status(500).json({ message: 'Error disabling 2FA' });
  }
};
