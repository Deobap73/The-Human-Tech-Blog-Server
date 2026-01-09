// src/middleware/csrfMiddleware.ts

import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

// rotas que nao devem usar CSRF porque sao chamadas por automacoes server to server
const CSRF_BYPASS_PATHS = [
  '/api/posts/automation',
  // se tiveres mais endpoints de automacao, mete aqui
];

function shouldBypassCsrf(req: Request): boolean {
  const path = req.originalUrl || req.path || '';
  return CSRF_BYPASS_PATHS.some((p) => path.startsWith(p));
}

export const csrfProtection = csrf({
  cookie: {
    key: '_csrfSecret',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : false,
    path: '/',
  },
  value: (req) =>
    (req.headers['x-csrf-token'] as string) || req.body?._csrf || req.query?._csrf || '',
});

export const csrfWithLogging = (req: Request, res: Response, next: NextFunction) => {
  if (shouldBypassCsrf(req)) {
    console.log('[csrfWithLogging] CSRF bypass for automation route', {
      method: req.method,
      path: req.originalUrl,
    });
    return next();
  }

  console.log('[csrfWithLogging] CSRF middleware triggered', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    tokenHeader: req.headers['x-csrf-token'],
    cookies: req.cookies,
  });

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
    }

    return next();
  });
};
