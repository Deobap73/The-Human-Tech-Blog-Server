// src/middleware/verifyCaptcha.ts

import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'test') return next();

  const { captcha } = req.body;
  console.log('[verifyCaptcha] captcha:', captcha);

  if (!captcha) return res.status(400).json({ message: 'Captcha token missing' });

  try {
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${env.RECAPTCHA_SECRET}&response=${captcha}`
    );

    console.log('[verifyCaptcha] response:', data);

    if (!data.success)
      return res.status(403).json({ message: 'Captcha verification failed', details: data });
    return next();
  } catch (error) {
    console.error('[verifyCaptcha] error:', error);
    return res.status(500).json({ message: 'Captcha verification error' });
  }
};
