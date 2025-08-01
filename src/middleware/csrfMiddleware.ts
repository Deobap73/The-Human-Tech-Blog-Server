import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * CSRF protection middleware.
 * - Stores the secret in a HTTP-only cookie named "_csrfSecret"
 * - Expects the token in the "X-CSRF-Token" header (double-submit)
 */
export const csrfProtection = csrf({
  cookie: {
    key: '_csrfSecret', // secret is stored here (not exposed)
    httpOnly: true, // not accessible by JS
    secure: isProduction, // only sent over HTTPS in prod
    sameSite: isProduction ? 'none' : false,
    path: '/',
    // domain REMOVED! Cookie will be scoped to api.thehumantechblog.com only.
  },
  // Look for token in header, body or query
  value: (req) =>
    (req.headers['x-csrf-token'] as string) || req.body?._csrf || req.query?._csrf || '',
});

/**
 * Wrapper around csurf that logs both success and failure.
 */
export const csrfWithLogging = (req: Request, res: Response, next: NextFunction) => {
  console.log('[csrfWithLogging] CSRF middleware triggered', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    tokenHeader: req.headers['x-csrf-token'],
    cookies: req.cookies,
  });

  // Delegate to the core csurf middleware
  return csrfProtection(req, res, (err) => {
    if (err) {
      console.error('[csrfWithLogging] CSRF validation failed', {
        error: err.message,
        method: req.method,
        path: req.path,
        cookies: req.cookies,
        headers: req.headers,
      });
      return res.status(403).json({ message: 'CSRF token validation failed' });
    } else {
      console.log('[csrfWithLogging] CSRF validation successful', {
        method: req.method,
        path: req.path,
      });
      return next();
    }
  });
};
