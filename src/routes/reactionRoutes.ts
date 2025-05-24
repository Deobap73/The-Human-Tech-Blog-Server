// src/routes/reactionRoutes.ts

import express from 'express';
import { toggleReaction, getReactions } from '../controllers/reactionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Adiciona/troca/remove reação (POST)
router.post('/', protect, toggleReaction);

// Lista as reações de um post/comentário (GET)
router.get('/', getReactions);

export default router;
