// /src/routes/projectSyncAdminRoutes.ts
'use strict';

import { Router } from 'express';
import { syncFigmaById, syncGitHubById } from '../controllers/projectSyncAdminController';
// import { requireAuth, requireRole } from '../middleware/roleMiddleware'; // enable when auth is wired

const router = Router();

// NOTE: keep these admin-only; wire up auth/role middleware later
router.post(
  '/admin/projects/sync/github/:id',
  /* requireAuth, requireRole('admin'), */ syncGitHubById
);
router.post(
  '/admin/projects/sync/figma/:id',
  /* requireAuth, requireRole('admin'), */ syncFigmaById
);

export default router;
