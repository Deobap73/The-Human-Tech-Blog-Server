// The-Human-Tech-Blog-Server/src/routes/authRoutes.ts

import express from 'express';
import passport from 'passport';
import { login, logout, register, refreshToken, getMe } from '../controllers/authController';
import { handleOAuthCallback } from '../controllers/oauthController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';
// import { csrfProtection } from '../middleware/csrfMiddleware'; // Mantenha este import se usado em OUTRAS rotas
import { authLimiter } from '../middleware/rateLimiter';
import { getAdminDashboard } from '../controllers/adminController';

const router = express.Router();

console.log('[authRoutes] Auth routes loaded.');

// Removida a rota CSRF duplicada, que já é tratada em app.ts
// Removido o import de csrf para evitar conflitos se não usado em outras rotas aqui.

// Auth routes
// CORRIGIDO: Removido csrfProtection daqui, pois já é aplicado globalmente em app.ts para /api
router.post('/login', authLimiter, login);

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
