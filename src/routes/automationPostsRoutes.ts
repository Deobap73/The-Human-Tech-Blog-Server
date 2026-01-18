// /src/routes/automationPostsRoutes.ts

'use strict';

import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

/**
 * Legacy endpoint placeholder.
 * This route used an outdated payload and a different Post schema shape.
 * It is intentionally disabled to avoid accidental usage from Make scenarios.
 *
 * Use instead:
 * POST /posts/automation/drafts
 * Auth: Authorization Bearer at_<token>
 */
router.post('/automation/posts', (_req: Request, res: Response) => {
  return res.status(410).json({
    ok: false,
    error: 'Legacy automation endpoint disabled. Use POST /posts/automation/drafts.',
  });
});

export default router;
