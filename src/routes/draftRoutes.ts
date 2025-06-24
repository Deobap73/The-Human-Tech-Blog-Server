// 📄 The-Human-Tech-Blog-Server/src/routes/draftRoutes.ts
import { Router } from 'express';
import {
  createDraft,
  deleteDraft,
  getDraftById,
  updateDraft,
  getMyDrafts,
  getAllDrafts,
  publishDraft,
} from '../controllers/draftController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { verifyDraftOwnership } from '../middleware/draftOwnership';

const router = Router();

// 🔒 Todas as rotas requerem autenticação
router.use(protect);

// 📝 Criar novo rascunho
router.post('/', createDraft);

// 👤 Listar meus próprios rascunhos
router.get('/me', getMyDrafts);

// 🔒 Admin pode ver todos os rascunhos
router.get('/', authorizeRoles('admin'), getAllDrafts);

// 🧾 Obter rascunho por ID (apenas se for o autor)
router.get('/:id', verifyDraftOwnership, getDraftById);

// ✏️ Atualizar rascunho (apenas se for o autor)
router.patch('/:id', verifyDraftOwnership, updateDraft);

// ❌ Excluir rascunho (apenas se for o autor)
router.delete('/:id', verifyDraftOwnership, deleteDraft);

// 📝 publica draft
router.post('/:id/publish', verifyDraftOwnership, publishDraft);

export default router;
