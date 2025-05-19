// src/routes/draftRoutes.ts

import { Router } from 'express';
import {
  createDraft,
  updateDraft,
  deleteDraft,
  getDraftById,
} from '../controllers/draftController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, createDraft);
router.patch('/:id', protect, updateDraft);
router.get('/:id', protect, getDraftById);
router.delete('/:id', protect, deleteDraft);

export default router;
