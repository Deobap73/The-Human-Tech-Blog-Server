// src/middleware/csrfMiddleware.ts
import csrf from 'csurf';

export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
});
