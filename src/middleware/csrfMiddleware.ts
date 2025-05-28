// ✅ src/middleware/csrfMiddleware.ts
import csrf from 'csurf';
import { env } from '../config/env';
import { Request, Response, NextFunction } from 'express';

console.log('[csrfMiddleware] Loading CSRF middleware module.'); // Added debug log

export const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: '/',
  },
});
console.log('[csrfMiddleware] csrfProtection instance created.'); // Added debug log
console.log(
  `[csrfMiddleware] CSRF cookie config: httpOnly=${true}, secure=${env.isProduction}, sameSite=${env.isProduction ? 'strict' : 'lax'}, path=/`
); // Added debug log

// Add logging to CSRF middleware
export const csrfWithLogging = (req: Request, res: Response, next: NextFunction) => {
  console.log('---'); // Added debug log for separation
  console.log('[csrfWithLogging] CSRF protection middleware triggered', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin, // Added debug log for origin
    'x-csrf-token': req.headers['x-csrf-token'], // Added debug log for CSRF token header
  });

  return csrfProtection(req, res, (err) => {
    if (err) {
      console.error('[csrfWithLogging] CSRF validation failed', {
        error: err.message, // Log only the message for brevity
        code: (err as any).code, // Log error code if available
        method: req.method,
        path: req.path,
        ip: req.ip, // Added debug log for IP address
        cookies: req.cookies, // Added debug log for received cookies
      });
      return res.status(403).json({ message: 'CSRF token validation failed' });
    }

    console.log('[csrfWithLogging] CSRF validation successful', {
      method: req.method,
      path: req.path,
    });
    console.log('---'); // Added debug log for separation
    return next();
  });
};
console.log('[csrfMiddleware] csrfWithLogging function defined.'); // Added debug log
