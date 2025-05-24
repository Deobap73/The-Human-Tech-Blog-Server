// src/routes/tagRoutes.ts

import express from 'express';
import { getAllTags, createTag, deleteTag, getPostsByTagSlug } from '../controllers/tagController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

router.get('/', getAllTags);
router.post('/', protect, authorizeRoles('admin', 'editor'), createTag);
router.delete('/:id', protect, authorizeRoles('admin', 'editor'), deleteTag);
router.get('/:slug/posts', getPostsByTagSlug);

export default router;
