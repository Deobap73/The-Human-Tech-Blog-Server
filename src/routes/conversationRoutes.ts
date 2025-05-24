// src/routes/conversationRoutes.ts

import express from 'express';
import {
  getUserConversations,
  createOrGetConversation,
} from '../controllers/conversationController';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', isAuthenticated, getUserConversations);
router.post('/', isAuthenticated, createOrGetConversation);

export default router;
