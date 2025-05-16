// src/routes/authRoutes.ts
import express, { Request, Response } from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController';
// import { debugRequestHeaders } from '../middleware/debugRequestHeaders';
import { handleOAuthCallback } from '../controllers/oauthController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';
import { csrfProtection } from '../middleware/csrfMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { getAdminDashboard } from '../controllers/adminController';
import csrf from 'csurf';
import { env } from '../config/env';

const router = express.Router();

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

router.post('/login', authLimiter, csrfProtection, authController.handleLogin);
router.post('/token', authController.handleToken);
router.post('/register', authLimiter, authController.handleRegister);
router.post('/logout', authController.handleLogout);
router.post('/refresh', authController.handleRefreshToken);
router.get('/me', protect, authController.handleGetMe);
router.get('/admin', protect, isAdmin, getAdminDashboard);

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
