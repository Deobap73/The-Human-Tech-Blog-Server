// /src/routes/notificationRoutes.ts

import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  createNotification,
} from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';
import { detectLanguage } from '../middleware/detectLanguage';

const router = express.Router();

// Todas protegidas
router.get('/:lang/notifications', protect, detectLanguage, getNotifications);
router.patch('/notifications/:id/read', protect, markNotificationRead);
router.delete('/notifications/:id', protect, deleteNotification);
router.post('/notifications', protect, createNotification);

export default router;
