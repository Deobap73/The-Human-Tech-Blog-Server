// The-Human-Tech-Blog-Server/src/routes/reactionRoutes.ts

import express from 'express';
import { toggleReaction, getReactions } from '../controllers/reactionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, toggleReaction);
router.get('/:postId', getReactions);

export default router;
