// /src/routes/projectSyncRoutes.ts
'use strict';

import { Router, Request, Response } from 'express';
import { syncProjectFigma, syncProjectGitHub } from '../services/project.sync.service';

/**
 * Lightweight protection using an admin sync key in headers.
 * Set ADMIN_SYNC_KEY in .env and pass header: x-admin-key: <key>
 * You can later replace by your JWT+role middleware.
 */
function requireSyncKey(req: Request, res: Response, next: () => void) {
  const key = process.env.ADMIN_SYNC_KEY || '';
  const provided = req.header('x-admin-key') || '';
  if (!key || provided !== key) {
    res.status(401).json({ message: 'Unauthorized sync.' });
    return;
  }
  next();
}

const router = Router();

// POST /projects/:id/sync/figma
router.post('/:id/sync/figma', requireSyncKey, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { figmaPublicUrl, figmaFileKey } = req.body || {};
  const result = await syncProjectFigma(id, { figmaPublicUrl, figmaFileKey });
  if (!result.ok) return res.status(400).json(result);
  return res.status(200).json(result);
});

// POST /projects/:id/sync/github
router.post('/:id/sync/github', requireSyncKey, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { repo } = req.body || {};
  const result = await syncProjectGitHub(id, { repo });
  if (!result.ok) return res.status(400).json(result);
  return res.status(200).json(result);
});

export default router;
