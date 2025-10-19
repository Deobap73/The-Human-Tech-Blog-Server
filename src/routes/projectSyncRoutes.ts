// /src/routes/projectSyncRoutes.ts
'use strict';

import { Router, Request, Response, NextFunction } from 'express';
import { syncProjectFigma, syncProjectGitHub } from '../services/project.sync.service';

// JWT + role middlewares (teus)
import { protect } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = Router();

/**
 * Hybrid admin guard:
 * - If header x-admin-key matches ADMIN_SYNC_KEY, allow.
 * - Otherwise, require JWT + admin role.
 * This keeps CI/automation simple while maintaining strong auth for humans.
 */
function hybridAdminGuard(req: Request, res: Response, next: NextFunction): void | Promise<void> {
  const configuredKey = (process.env.ADMIN_SYNC_KEY || '').trim();
  const providedKey = (req.header('x-admin-key') || '').trim();

  // Fast-path: header key matches
  if (configuredKey && providedKey && providedKey === configuredKey) {
    return next();
  }

  // Fallback: require JWT + admin
  // Note: protect/isAdmin send response on failure; we just chain them.
  // We call protect first (it’s async), then isAdmin (sync).
  return (protect as any)(req, res, (err?: unknown) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    return (isAdmin as any)(req, res, next);
  });
}

/**
 * POST /projects/:id/sync/figma
 * Body: { figmaPublicUrl?: string; figmaFileKey?: string }
 */
router.post('/:id/sync/figma', hybridAdminGuard, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { figmaPublicUrl, figmaFileKey } = (req.body || {}) as {
    figmaPublicUrl?: string;
    figmaFileKey?: string;
  };

  const result = await syncProjectFigma(id, { figmaPublicUrl, figmaFileKey });
  if (!result.ok) return res.status(400).json(result);
  return res.status(200).json(result);
});

/**
 * POST /projects/:id/sync/github
 * Body: { repo?: string } // e.g. "owner/name"
 */
router.post('/:id/sync/github', hybridAdminGuard, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { repo } = (req.body || {}) as { repo?: string };

  const result = await syncProjectGitHub(id, { repo });
  if (!result.ok) return res.status(400).json(result);
  return res.status(200).json(result);
});

export default router;
