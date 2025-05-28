// The-Human-Tech-Blog-Server/src/routes/authRoutes.ts

import express, { Request, Response } from 'express';
import passport from 'passport';
import { login, logout, register, refreshToken, getMe } from '../controllers/authController';
import { handleOAuthCallback } from '../controllers/oauthController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';
import { csrfProtection } from '../middleware/csrfMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { getAdminDashboard } from '../controllers/adminController';
import csrf from 'csurf';
import { env } from '../config/env';

const router = express.Router();

console.log('[authRoutes] Auth routes loaded.'); // Added debug log
// Emite CSRF token cookie para todas as rotas
router.get('/csrf', csrf({ cookie: true }), (req: Request, res: Response) => {
  console.log('[authRoutes] GET /csrf - Attempting to issue CSRF token.'); // Added debug log
  if (typeof req.csrfToken !== 'function') {
    console.error('[authRoutes] GET /csrf - CSRF token method not available.'); // Added debug log
    res.status(500).json({ message: 'CSRF token method not available' });
    return;
  }
  const token = req.csrfToken();
  console.log(`[authRoutes] GET /csrf - Generated CSRF token: ${token}`); // Added debug log
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: '/',
  });
  console.log('[authRoutes] GET /csrf - CSRF token cookie set.'); // Added debug log
  res.status(200).json({ csrfToken: token });
});

// Auth routes
router.post('/login', authLimiter, csrfProtection, login);
console.log('[authRoutes] POST /login route registered.'); // Added debug log
router.post('/token', refreshToken);
console.log('[authRoutes] POST /token route registered.'); // Added debug log
router.post('/register', authLimiter, register);
console.log('[authRoutes] POST /register route registered.'); // Added debug log
router.post('/logout', logout);
console.log('[authRoutes] POST /logout route registered.'); // Added debug log
router.post('/refresh', refreshToken);
console.log('[authRoutes] POST /refresh route registered.'); // Added debug log
router.get('/me', protect, getMe);
console.log('[authRoutes] GET /me route registered.'); // Added debug log
router.get('/admin', protect, isAdmin, getAdminDashboard);
console.log('[authRoutes] GET /admin route registered.'); // Added debug log

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
console.log('[authRoutes] GET /google OAuth route registered.'); // Added debug log
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  handleOAuthCallback
);
console.log('[authRoutes] GET /google/callback OAuth route registered.'); // Added debug log
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
console.log('[authRoutes] GET /github OAuth route registered.'); // Added debug log
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  handleOAuthCallback
);
console.log('[authRoutes] GET /github/callback OAuth route registered.'); // Added debug log

export default router;
