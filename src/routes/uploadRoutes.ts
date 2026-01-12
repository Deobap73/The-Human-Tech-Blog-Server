// ./src/routes/uploadRoutes.ts
'use strict';

import { Router } from 'express';

import upload from '../middleware/uploadMiddleware';
import { uploadPostCover } from '../controllers/uploadController';

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
  uploadPostCover
);

export default router;
