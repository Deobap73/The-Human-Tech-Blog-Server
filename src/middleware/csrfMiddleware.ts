// ✅ src/middleware/csrfMiddleware.ts
import csrf from 'csurf';
import { env } from '../config/env';

export const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: '/',
  },
});
