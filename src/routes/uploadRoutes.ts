// ./src/routes/uploadRoutes.ts
'use strict';

import { Router } from 'express';

import upload from '../middleware/uploadMiddleware';
import { uploadPostCover, uploadPostInstagramImage } from '../controllers/uploadController';

import { isAuthenticated } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

/**
 * POST /api/uploads/post-cover
 * multipart/form-data:
 *  image: File
 *  isQuickPost: "true" | "false"
 *  isAiPrompt: "true" | "false"
 *  categoryId: string (optional)
 */
router.post(
  '/uploads/post-cover',
  isAuthenticated,
  authorizeRoles('admin', 'editor'),
  upload.single('image'),
  uploadPostCover,
);

/**
 * POST /api/uploads/post-instagram
 * multipart/form-data:
 *  image: File
 *  postId: string (optional)
 *  slug: string (optional)
 */
router.post(
  '/uploads/post-instagram',
  isAuthenticated,
  authorizeRoles('admin', 'editor'),
  upload.single('image'),
  uploadPostInstagramImage,
);

export default router;
