// The-Human-Tech-Blog-Server/src/routes/commentRoutes.ts

import express from 'express';
import { createComment, getCommentsByPost } from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createComment);

router.get('/:postId', getCommentsByPost);

export default router;
