// src/routes/messageRoutes.ts
import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:conversationId', isAuthenticated, getMessages);
router.post('/:conversationId', isAuthenticated, sendMessage);

export default router;
