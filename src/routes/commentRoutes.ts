// src/routes/commentRoutes.ts

import express from 'express';
import { createComment, getCommentsByPost, deleteComment } from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/:postId', getCommentsByPost);
router.delete('/:id', protect, deleteComment);

export default router;
