// ✅ The-Human-Tech-Blog-Server/src/routes/draftRoutes.ts

import express from 'express';
import {
  createDraft,
  getDraftById,
  updateDraft,
  deleteDraft,
  getAllDrafts,
  getMyDrafts,
} from '../controllers/draftController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

// 👤 Autenticado (qualquer utilizador)
router.post('/', protect, createDraft);
router.get('/me', protect, getMyDrafts);
router.get('/:id', protect, getDraftById);
router.patch('/:id', protect, updateDraft);
router.delete('/:id', protect, deleteDraft);

// 🔒 Apenas admin pode ver todos os rascunhos
router.get('/', protect, authorizeRoles('admin'), getAllDrafts);

export default router;
