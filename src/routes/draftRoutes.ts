// 📄 The-Human-Tech-Blog-Server/src/routes/draftRoutes.ts
import { Router } from 'express';
import {
  createDraft,
  deleteDraft,
  getDraftById,
  updateDraft,
  getMyDrafts,
  getAllDrafts,
} from '../controllers/draftController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { verifyDraftOwnership } from '../middleware/draftOwnership';

const router = Router();

router.use(protect);

router.post('/', createDraft);
router.get('/me', getMyDrafts);
router.get('/', authorizeRoles('admin'), getAllDrafts);
router.get('/:id', verifyDraftOwnership, getDraftById);
router.patch('/:id', verifyDraftOwnership, updateDraft);
router.delete('/:id', verifyDraftOwnership, deleteDraft);

export default router;
