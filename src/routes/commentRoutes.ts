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

const router = express.Router();

// Rota para contar comentários pendentes (KPI, badge)
router.get(
  '/moderation/count',
  protect,
  authorizeRoles('admin', 'editor'),
  getPendingCommentsCount
);

// Rota para listar todos comentários pendentes
router.get('/moderation', protect, authorizeRoles('admin', 'editor'), listPendingComments);

// Rota para aprovar comentário
router.patch('/moderation/:id/approve', protect, authorizeRoles('admin', 'editor'), approveComment);

// Rota para rejeitar comentário
router.patch('/moderation/:id/reject', protect, authorizeRoles('admin', 'editor'), rejectComment);

// Rotas normais de comentários (estas vêm DEPOIS)
router.post('/', protect, createComment);
router.get('/:postId', getCommentsByPost); // esta rota SEMPRE no final, para não capturar '/moderation'
router.delete('/:id', protect, deleteComment);

export default router;
