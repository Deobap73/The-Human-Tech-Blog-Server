// File: src/routes/aiPromptRoutes.ts
import { Router } from 'express';
import * as aiPromptController from '../controllers/aiPromptController';
import { protect as authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', aiPromptController.getAiPrompts);
router.get('/:id', aiPromptController.getAiPromptById);
router.get('/slug/:slug', aiPromptController.getAiPromptBySlug);
router.post('/', authMiddleware, aiPromptController.createAiPrompt);
router.put('/:id', authMiddleware, aiPromptController.updateAiPrompt);
router.delete('/:id', authMiddleware, aiPromptController.deleteAiPrompt);

export default router;
