// /src/middleware/csrfMiddleware.ts

import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

export const csrfProtection = csrf({
  cookie: {
    key: 'XSRF-TOKEN',
    httpOnly: false,
    secure: false, // Only true in production with HTTPS
    sameSite: false, // Disabled in dev to allow localhost:5173 <-> 5000 cookies
    path: '/',
    domain: undefined, // Let browser manage domain (localhost for dev)
  },
});

// Logging for debug
export const csrfWithLogging = (req: Request, res: Response, next: NextFunction) => {
  console.log('[csrfWithLogging] CSRF protection middleware triggered', {
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
      });
      return res.status(403).json({ message: 'CSRF token validation failed' });
    }

    console.log('[csrfWithLogging] CSRF validation successful', {
      method: req.method,
      path: req.path,
    });
    return next();
  });
};
