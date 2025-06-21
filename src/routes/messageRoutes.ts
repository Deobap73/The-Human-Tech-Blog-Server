// src/routes/messageRoutes.ts

import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController';
import { isAuthenticated } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/:conversationId', isAuthenticated, getMessages);

// Use .single('file') to handle single file uploads
router.post('/:conversationId', isAuthenticated, upload.single('file'), sendMessage);

export default router;
