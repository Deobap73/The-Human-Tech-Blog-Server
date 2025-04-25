// The-Human-Tech-Blog-Server/src/routes/authRoutes.ts

import express from 'express';
import passport from 'passport';
import { register, login } from '../controllers/authController';
import { getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { logout } from '../controllers/authController';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/admin-data', protect, authorize('admin'), (req, res) => {
  res.send('This is admin-only data');
});
router.post('/logout', logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

export default router;
