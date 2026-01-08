// /src/routes/postAutomationRoutes.ts

'use strict';

import express from 'express';
import { createPost, updatePost } from '../controllers/postController';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { protectAutomationToken } from '../middleware/automationTokenAuthMiddleware';

const router = express.Router();

/**
 * Automation endpoints for Make.
 * No CSRF here by design.
 * Auth is via Authorization: Bearer at_<token>
 */
router.post(
  '/posts/automation',
  protectAutomationToken,
  authorizeRoles('admin', 'editor'),
  createPost
);

router.put(
  '/posts/automation/:id',
  protectAutomationToken,
  authorizeRoles('admin', 'editor'),
  updatePost
);

export default router;
