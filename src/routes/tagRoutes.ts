// /src/routes/tagRoutes.ts

import express from 'express';
import {
  getAllTags,
  getTagBySlug,
  createTag,
  deleteTag,
  getPostsByTagSlug,
} from '../controllers/tagController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { detectLanguage } from '../middleware/detectLanguage';

const router = express.Router();

router.get('/:lang/tags', detectLanguage, getAllTags);
router.get('/:lang/tags/:slug', detectLanguage, getTagBySlug);

router.get('/:slug/posts', getPostsByTagSlug);

router.post('/tags', protect, authorizeRoles('admin', 'editor'), createTag);
router.delete('/tags/:id', protect, authorizeRoles('admin', 'editor'), deleteTag);

export default router;
