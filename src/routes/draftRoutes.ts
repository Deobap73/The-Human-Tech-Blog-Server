// The-Human-Tech-Blog-Server/src/routes/draftRoutes.ts
import express from 'express';
import {
  createDraft,
  updateDraft,
  getDraftById,
  deleteDraft,
  getAllDrafts,
  getMyDrafts,
} from '../controllers/draftController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

// 📥 POST /api/drafts – criar novo rascunho (user ou editor)
router.post('/', protect, createDraft);

// 🔄 PATCH /api/drafts/:id – atualizar rascunho
router.patch('/:id', protect, updateDraft);

// 🔍 GET /api/drafts/:id – buscar um rascunho específico
router.get('/:id', protect, getDraftById);

// 🗑 DELETE /api/drafts/:id – excluir rascunho
router.delete('/:id', protect, deleteDraft);

// 👤 GET /api/drafts/me – buscar os drafts do utilizador atual
router.get('/me', protect, getMyDrafts);

// 🛡️ GET /api/drafts – listar todos os rascunhos (admin only)
router.get('/', protect, authorizeRoles('admin'), getAllDrafts);

export default router;
