// The-Human-Tech-Blog-Server/src/routes/authRoutes.ts

import express from 'express';
import { register, login } from '../controllers/authController';
import { getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
