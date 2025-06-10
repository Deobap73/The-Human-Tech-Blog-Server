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
console.log('[authRoutes] POST /login route registered.');

router.post('/token', refreshToken);
console.log('[authRoutes] POST /token route registered.');

router.post('/register', authLimiter, register);
console.log('[authRoutes] POST /register route registered.');

router.post('/logout', logout);
console.log('[authRoutes] POST /logout route registered.');

router.post('/refresh', refreshToken);
console.log('[authRoutes] POST /refresh route registered.');

router.get('/me', protect, getMe);
console.log('[authRoutes] GET /me route registered.');

router.get('/admin', protect, isAdmin, getAdminDashboard);
console.log('[authRoutes] GET /admin route registered.');

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
console.log('[authRoutes] GET /google OAuth route registered.');

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  handleOAuthCallback
);
console.log('[authRoutes] GET /google/callback OAuth route registered.');

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
console.log('[authRoutes] GET /github OAuth route registered.');

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  handleOAuthCallback
);
console.log('[authRoutes] GET /github/callback OAuth route registered.');

export default router;
