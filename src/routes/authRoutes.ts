// /src/routes/authRoutes.ts

import express from 'express';
import passport from 'passport';
import { login, logout, register, refreshToken, getMe } from '../controllers/authController';
import { handleOAuthCallback } from '../controllers/oauthController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { getAdminDashboard } from '../controllers/adminController';
import { verifyCaptcha } from '../middleware/verifyCaptcha';

const router = express.Router();

console.log('[authRoutes] Auth routes loaded.');

// --- Add verifyCaptcha before login and register ---
router.post('/login', authLimiter, verifyCaptcha, login);

router.post('/token', refreshToken);

router.post('/register', authLimiter, verifyCaptcha, register);

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
