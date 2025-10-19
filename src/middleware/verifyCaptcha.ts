// File: /src/middleware/verifyCaptcha.ts
// Description: Google reCAPTCHA v3 verification middleware with safe fallbacks.
// - Skips verification when NODE_ENV !== 'production'.
// - Reads secrets from env config OR process.env to avoid TS typing issues.
// - Exports both default and named export for compatibility.

import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Safe getters with fallbacks (avoid TS error if env typing lacks these keys)
const getRecaptchaSecret = (): string => {
  // Prefer env (if present), else process.env, else empty string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const secret = (env as any).RECAPTCHA_SECRET ?? process.env.RECAPTCHA_SECRET ?? '';
  return String(secret);
};

const getRecaptchaMinScore = (): number => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fromEnvObj = (env as any).RECAPTCHA_MIN_SCORE;
  const fromProcess = process.env.RECAPTCHA_MIN_SCORE;
  const raw = fromEnvObj ?? fromProcess ?? 0.5; // default 0.5
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0.5;
};

/**
 * Middleware to verify Google reCAPTCHA v3 token from frontend.
 * • Logs token and API response for debugging.
 * • Skips verification when NODE_ENV !== 'production'.
 */
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  // 1) Skip in non-production to speed up local/dev/test
  if (process.env.NODE_ENV !== 'production') {
    console.log('[verifyCaptcha] Skipping captcha verification in non-production');
    return next();
  }

  // 2) Extract token
  const { captcha } = req.body || {};
  if (!captcha) {
    console.warn('[verifyCaptcha] Missing captcha token');
    return res.status(400).json({ message: 'Captcha token missing' });
  }

  try {
    // 3) Call Google API
    const secret = getRecaptchaSecret();
    if (!secret) {
      console.error('[verifyCaptcha] Missing RECAPTCHA_SECRET in environment');
      return res.status(500).json({ message: 'Captcha not configured' });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', String(captcha));

    const { data } = await axios.post(verifyUrl, params);
    console.log('[verifyCaptcha] Google reCAPTCHA response:', data);

    // 4) Check success & minimum score
    const minScore = getRecaptchaMinScore();
    if (!data?.success || (typeof data?.score === 'number' && data.score < minScore)) {
      console.warn('[verifyCaptcha] Captcha verification failed:', {
        success: data?.success,
        score: data?.score,
        'error-codes': data?.['error-codes'],
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

// Default export for routers using `import verifyCaptcha from ...`
export default verifyCaptcha;
