// src/routes/twofaRoutes.ts

import express from 'express';
import { generate2FASecret, verify2FAToken, disable2FA } from '../controllers/twofaController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/generate', protect, generate2FASecret);
router.post('/verify', protect, verify2FAToken);
router.post('/disable', protect, disable2FA);

export { router as twofaRoutes };
