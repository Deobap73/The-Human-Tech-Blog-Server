// src/routes/newsletterRoutes.ts

import express from 'express';
import { subscribeNewsletter, listSubscribers } from '../controllers/newsletterController';
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', protect, isAdmin, listSubscribers);

export default router;
