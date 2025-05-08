// src/routes/authRoutes.ts

import { env } from '../config/env';
import express from 'express';
import passport from 'passport';
import { register, login, logout, getMe, refresh } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { getAdminDashboard } from '../controllers/adminController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.get('/admin', protect, authorizeRoles('admin'), getAdminDashboard);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', {
    successRedirect: env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

export default router;
