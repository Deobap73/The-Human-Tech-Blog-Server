// src/middleware/verifyCaptcha.ts
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  const { captcha } = req.body;
  if (!captcha) return res.status(400).json({ message: 'Captcha token missing' });

  try {
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${env.RECAPTCHA_SECRET}&response=${captcha}`
    );

    if (!data.success) {
      return res.status(403).json({ message: 'Captcha verification failed' });
    }

    return next(); // ✅ adiciona return explícito aqui
  } catch {
    return res.status(500).json({ message: 'Captcha verification error' });
  }
};
