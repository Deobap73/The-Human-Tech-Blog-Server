// /src/routes/csrf.ts
import { Router, Request, Response } from 'express';
import { csrfWithLogging } from '../middleware/csrfMiddleware';
import { env } from '../config/env';

const router = Router();

/**
 * Helper to issue CSRF token + set proper cookies (mirrors /api/auth/csrf)
 */
function issueCsrf(req: Request, res: Response): Response {
  try {
    const token = req.csrfToken();

    // Set the readable token cookie for Axios to pick up (double-submit strategy)
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'none' : 'lax',
      domain: env.isProduction ? '.thehumantechblog.com' : undefined,
      path: '/',
    });

    // Optional debug cookie with the secret (kept httpOnly)
    const secret = (req as any).cookies?._csrfSecret;
    if (secret) {
      res.cookie('_csrfSecret', secret, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: env.isProduction ? 'none' : 'lax',
        domain: env.isProduction ? '.thehumantechblog.com' : undefined,
        path: '/',
      });
    }

    return res.status(200).json({ csrfToken: token });
  } catch (err: any) {
    // Always return a value in async-like flows
    return res
      .status(500)
      .json({ success: false, message: 'Failed to issue CSRF token', details: err?.message });
  }
}

/**
 * Legacy + compatibility routes:
 *  - GET /api/csrf-token
 *  - GET /api/csrf/token
 * Both will set cookies and return { csrfToken } just like /api/auth/csrf.
 */
router.get('/csrf-token', csrfWithLogging, (req: Request, res: Response) => {
  return issueCsrf(req, res);
});

router.get('/csrf/token', csrfWithLogging, (req: Request, res: Response) => {
  return issueCsrf(req, res);
});

export default router;
