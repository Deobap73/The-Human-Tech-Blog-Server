// src/routes/newsletterRoutes.ts

import express from 'express';
import {
  subscribeNewsletter,
  confirmNewsletter,
  unsubscribeNewsletter,
  listSubscribers,
} from '../controllers/newsletterController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// Public endpoints
router.post('/subscribe', subscribeNewsletter);
router.get('/confirm/:token', confirmNewsletter);
router.post('/unsubscribe/:token', unsubscribeNewsletter);

// Admin endpoint
router.get('/subscribers', protect, isAdmin, listSubscribers);

export default router;
