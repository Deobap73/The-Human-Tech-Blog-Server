// src/routes/commentRoutes.ts

import express from 'express';
import { createComment, getCommentsByPost, deleteComment } from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { getPendingCommentsCount } from '../controllers/commentController';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/:postId', getCommentsByPost);
router.delete('/:id', protect, deleteComment);
router.get(
  '/moderation/count',
  protect,
  authorizeRoles('admin', 'editor'),
  getPendingCommentsCount
);

export default router;
