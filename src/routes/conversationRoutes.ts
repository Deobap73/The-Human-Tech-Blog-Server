// src/routes/conversationRoutes.ts
import express from 'express';
import { createConversation, getUserConversations } from '../controllers/conversationController';
import { protect } from '../middleware/authMiddleware';
import { isAdminOrTarget } from '../middleware/roleMiddleware';

const router = express.Router();

router.post('/', protect, createConversation);
router.get('/:userId', protect, isAdminOrTarget, getUserConversations);

export default router;
