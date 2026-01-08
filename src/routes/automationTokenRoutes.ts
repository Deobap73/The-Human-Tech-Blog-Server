// /src/routes/automationTokenRoutes.ts

'use strict';

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { csrfWithLogging } from '../middleware/csrfMiddleware';
import {
  createAutomationToken,
  listAutomationTokens,
  revokeAutomationToken,
} from '../controllers/automationTokenController';

const router = express.Router();

/**
 * Admin and editor only, tied to the authenticated user.
 * Uses normal JWT auth and CSRF, because you will create tokens via your admin UI session.
 */
router.get(
  '/admin/automationTokens',
  protect,
  authorizeRoles('admin', 'editor'),
  csrfWithLogging,
  listAutomationTokens
);

router.post(
  '/admin/automationTokens',
  protect,
  authorizeRoles('admin', 'editor'),
  csrfWithLogging,
  createAutomationToken
);

router.delete(
  '/admin/automationTokens/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  csrfWithLogging,
  revokeAutomationToken
);

export default router;
