// src/routes/twofaRoutes.ts
import express from 'express';
import {
  generate2FASecret,
  verify2FAToken,
  enable2FAForUser,
} from '../controllers/twofaController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

// GET QR Code + secret
router.get('/generate', protect, authorizeRoles('admin'), generate2FASecret);

// POST verify user token
router.post('/verify', protect, authorizeRoles('admin'), verify2FAToken);

// POST enable 2FA
router.post('/enable', protect, authorizeRoles('admin'), enable2FAForUser);

export default router;
