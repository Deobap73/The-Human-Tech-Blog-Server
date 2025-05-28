// The-Human-Tech-Blog-Server/src/routes/notificationRoutes.ts

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

console.log('[notificationRoutes] Notification routes loaded.'); // Added debug log
// Corrige o endpoint base para corresponder ao frontend!
router.get('/', protect, detectLanguage, getNotifications);
console.log('[notificationRoutes] GET / - Get notifications route registered.'); // Added debug log
router.patch('/:id/read', protect, markNotificationRead);
console.log('[notificationRoutes] PATCH /:id/read - Mark notification as read route registered.'); // Added debug log
router.delete('/:id', protect, deleteNotification);
console.log('[notificationRoutes] DELETE /:id - Delete notification route registered.'); // Added debug log
router.post('/', protect, createNotification);
console.log('[notificationRoutes] POST / - Create notification route registered.'); // Added debug log

export default router;
