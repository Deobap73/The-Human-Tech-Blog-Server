// src/controllers/oauthController.ts
import { Request, Response } from 'express';
import { issueTokens } from '../utils/issueTokens';
import { env } from '../config/env';

export const handleOAuthCallback = async (req: Request, res: Response) => {
  if (!req.user) return res.redirect(`${env.CLIENT_URL}/login-failed`);

  const user = req.user as any;

  const { accessToken } = await issueTokens(user._id.toString(), res);

  return res.redirect(`${env.CLIENT_URL}?token=${accessToken}`);
};
