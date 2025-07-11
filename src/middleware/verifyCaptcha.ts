// File: src/middleware/verifyCaptcha.ts

import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify Google reCAPTCHA v3 token from frontend.
 * • Logs token and API response for debugging.
 * • Skips verification when NODE_ENV !== 'production'.
 */
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  // 1) Skip in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[verifyCaptcha] Skipping captcha verification in non-production');
    return next();
  }

  // 2) Extract token
  const { captcha } = req.body;
  console.log('[verifyCaptcha] Received captcha token:', captcha);

  if (!captcha) {
    console.warn('[verifyCaptcha] Missing captcha token');
    return res.status(400).json({ message: 'Captcha token missing' });
  }

  try {
    // 3) Call Google API
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`;
    const { data } = await axios.post(verifyUrl);
    console.log('[verifyCaptcha] Google reCAPTCHA response:', data);

    // 4) Check success & score (hard-coded threshold)
    const minScore = 0.5;
    if (!data.success || (data.score ?? 0) < minScore) {
      console.warn('[verifyCaptcha] Captcha verification failed:', {
        success: data.success,
        score: data.score,
        'error-codes': data['error-codes'],
      });
      return res.status(403).json({ message: 'Captcha verification failed', details: data });
    }

    // 5) All good
    return next();
  } catch (err) {
    console.error('[verifyCaptcha] Error during captcha verification:', err);
    return res.status(500).json({ message: 'Captcha verification error' });
  }
};
