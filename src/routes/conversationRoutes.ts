// src/routes/conversationRoutes.ts
import express from 'express';
import { getUserConversations } from '../controllers/conversationController';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', isAuthenticated, getUserConversations);

export default router;
