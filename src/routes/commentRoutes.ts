// The-Human-Tech-Blog-Server/src/routes/commentRoutes.ts

import express from 'express';
import {
  createComment,
  getCommentsByPost,
  deleteComment,
  getPendingCommentsCount,
} from '../controllers/commentController';
import {
  listPendingComments,
  approveComment,
  rejectComment,
} from '../controllers/commentModerationController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { verifyCaptcha } from '../middleware/verifyCaptcha';

const router = express.Router();

// KPI pendentes
router.get(
  '/moderation/count',
  protect,
  authorizeRoles('admin', 'editor'),
  getPendingCommentsCount
);

// Lista pendentes
router.get('/moderation', protect, authorizeRoles('admin', 'editor'), listPendingComments);

// Aprovar e rejeitar
router.patch('/moderation/:id/approve', protect, authorizeRoles('admin', 'editor'), approveComment);
router.patch('/moderation/:id/reject', protect, authorizeRoles('admin', 'editor'), rejectComment);

// Criar comentário público
router.post('/', verifyCaptcha, createComment);

// Listar aprovados de um post
router.get('/:postId', getCommentsByPost);

// Apagar comentário
router.delete('/:id', protect, deleteComment);

export default router;
