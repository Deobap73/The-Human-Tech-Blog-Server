// The-Human-Tech-Blog-Server/src/routes/messageRoutes.ts

import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/messages - enviar nova mensagem
router.post('/', protect, sendMessage);

// GET /api/messages/:conversationId - buscar mensagens de uma conversa
router.get('/:conversationId', protect, getMessages);

export default router;
