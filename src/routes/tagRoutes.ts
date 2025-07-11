// src/routes/tagRoutes.ts

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

// Default tags endpoint at /api/tags
router.get(
  '/',
  (req, _res, next) => {
    (req as any).lang = 'en'; // default language
    next();
  },
  getAllTags
);

// Multilanguage endpoints: /api/tags/:lang
router.get('/:lang', detectLanguage, getAllTags);
router.get('/:lang/:slug', detectLanguage, getTagBySlug);

// Posts by tag: /api/tags/:slug/posts
router.get('/:slug/posts', getPostsByTagSlug);

// Admin endpoints
router.post('/', protect, authorizeRoles('admin', 'editor'), createTag);
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deleteTag);

export default router;
