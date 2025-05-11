// src/routes/authRoutes.ts
import express from 'express';
import passport from 'passport';
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGetMe,
  handleRefreshToken,
} from '../controllers/authController';
import { handleOAuthCallback } from '../controllers/oauthController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { csrfProtection } from '../middleware/csrfMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { verifyCaptcha } from '../middleware/verifyCaptcha';
import { getAdminDashboard } from '../controllers/adminController';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @body { name: string, email: string, password: string, token?: string }
 * @description Registra um novo usuário
 */
router.post('/register', authLimiter, verifyCaptcha, handleRegister);

/**
 * @route POST /api/auth/login
 * @body { email: string, password: string, token?: string }
 * @description Autentica um usuário (verifica 2FA se habilitado)
 */
router.post('/login', authLimiter, verifyCaptcha, handleLogin);

/**
 * @route POST /api/auth/logout
 */
router.post('/logout', handleLogout);

/**
 * @route POST /api/auth/refresh
 */
router.post('/refresh', handleRefreshToken);

/**
 * @route GET /api/auth/me
 */
router.get('/me', protect, handleGetMe);

/**
 * @route GET /api/auth/admin
 */
router.get('/admin', protect, authorizeRoles('admin'), getAdminDashboard);

/**
 * @route GET /api/auth/csrf
 */
router.get('/csrf', csrfProtection, (req, res) => {
  return res.status(200).json({ csrfToken: req.csrfToken() });
});

// OAuth - Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  handleOAuthCallback
);

// OAuth - GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  handleOAuthCallback
);

export default router;
