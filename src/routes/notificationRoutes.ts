// src/routes/notificationRoutes.ts

import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  createNotification,
} from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Todas protegidas (exemplo: ajustar conforme o projeto)
router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markNotificationRead);
router.delete('/:id', protect, deleteNotification);
// Rota para criar notificações (opcional, para teste ou admin)
router.post('/', protect, createNotification);

export default router;
