// The-Human-Tech-Blog-Server/src/routes/twofaRoutes.ts

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { generate2FA, verify2FA, disable2FA } from '../controllers/twofaController';

const router = express.Router();

router.post('/generate', protect, generate2FA);
router.post('/verify', protect, verify2FA);
router.post('/disable', protect, disable2FA);

export default router;
