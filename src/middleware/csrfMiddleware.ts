// /src/middleware/csrfMiddleware.ts

import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

/**
 * Custom CSRF middleware supporting token via header (X-CSRF-Token) or cookie.
 * Ready for cross-origin (CORS) with SameSite=None for production.
 */
export const csrfProtection = csrf({
  cookie: {
    key: 'XSRF-TOKEN',
    httpOnly: false, // So browser JS can read it for sending in header
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.thehumantechblog.com' : undefined,
  },
  value: (req) =>
    req.headers['x-csrf-token']?.toString() ||
    req.headers['X-CSRF-Token']?.toString() || // case-insensitive
    req.body?._csrf ||
    req.query?._csrf ||
    req.cookies['XSRF-TOKEN'] ||
    '',
});

/**
 * Debug CSRF middleware with detailed logging.
 */
export const csrfWithLogging = (req: Request, res: Response, next: NextFunction) => {
  console.log('[csrfWithLogging] CSRF middleware triggered', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    'x-csrf-token': req.headers['x-csrf-token'],
    cookies: req.cookies,
  });

  return csrfProtection(req, res, (err) => {
    if (err) {
      console.error('[csrfWithLogging] CSRF validation failed', {
        error: err.message,
        code: (err as any).code,
        method: req.method,
        path: req.path,
        ip: req.ip,
        cookies: req.cookies,
        allHeaders: req.headers,
      });
      return res.status(403).json({ message: 'CSRF token validation failed' });
    }

    console.log('[csrfWithLogging] CSRF validation successful', {
      method: req.method,
      path: req.path,
      cookies: req.cookies,
    });
    return next();
  });
};
