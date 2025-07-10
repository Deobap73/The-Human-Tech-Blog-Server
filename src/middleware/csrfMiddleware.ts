// src/middleware/csrfMiddleware.ts

import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const csrfProtection = csrf({
  cookie: {
    key: 'XSRF-TOKEN',
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    domain: isProd ? '.thehumantechblog.com' : undefined,
  },
  value: (req) =>
    req.headers['x-csrf-token']?.toString() ||
    req.body?._csrf ||
    req.query?._csrf ||
    req.cookies['XSRF-TOKEN'] ||
    '',
});

/**
 * Debug CSRF middleware with detailed logging.
 */
export const csrfWithLogging = (req: Request, res: Response, next: NextFunction) => {
  console.log('[csrfWithLogging] CSRF protection middleware triggered', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    'x-csrf-token': req.headers['x-csrf-token'],
    cookies: req.cookies,
    allHeaders: req.headers,
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
      allHeaders: req.headers,
    });
    return next();
  });
};
