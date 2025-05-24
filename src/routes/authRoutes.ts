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

// Emite CSRF token cookie para todas as rotas
router.get('/csrf', csrf({ cookie: true }), (req: Request, res: Response) => {
  if (typeof req.csrfToken !== 'function') {
    res.status(500).json({ message: 'CSRF token method not available' });
    return;
  }
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: '/',
  });
  res.status(200).json({ csrfToken: token });
});

// Auth routes
router.post('/login', authLimiter, csrfProtection, login);
router.post('/token', refreshToken);
router.post('/register', authLimiter, register);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.get('/admin', protect, isAdmin, getAdminDashboard);

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  handleOAuthCallback
);
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  handleOAuthCallback
);

export default router;
