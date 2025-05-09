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
import { getAdminDashboard } from '../controllers/adminController';

const router = express.Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/logout', handleLogout);
router.post('/refresh', handleRefreshToken);
router.get('/me', protect, handleGetMe);
router.get('/admin', protect, authorizeRoles('admin'), getAdminDashboard);
router.get('/csrf', csrfProtection, (req, res) => {
  return res.status(200).json({ csrfToken: req.csrfToken() });
});

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
