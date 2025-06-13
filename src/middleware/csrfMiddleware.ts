// /src/middleware/csrfMiddleware.ts

import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

/**
 * Custom CSRF middleware supporting token via header (X-CSRF-Token) or cookie.
 * This is required for multipart/form-data requests, since browsers can't set headers automatically for FormData,
 * so the frontend must ensure the correct header is always set (handled in frontend code).
 */
export const csrfProtection = csrf({
  cookie: {
    key: 'XSRF-TOKEN',
    httpOnly: false,
    secure: false, // Only true in production with HTTPS
    sameSite: false, // Disabled in dev to allow localhost:5173 <-> 5000 cookies
    path: '/',
    domain: undefined, // Let browser manage domain (localhost for dev)
  },
  value: (req) =>
    req.headers['x-csrf-token']?.toString() ||
    req.body?._csrf ||
    req.query?._csrf ||
    req.cookies['XSRF-TOKEN'] ||
    '', // Fallback for all sources
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
