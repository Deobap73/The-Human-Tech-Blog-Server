// /src/controllers/projectSyncAdminController.ts
'use strict';

import { Request, Response } from 'express';
import { syncProjectFigma, syncProjectGitHub } from '../services/project.sync.service';

export async function syncGitHubById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { repo, token } = req.body ?? {};
    const result = await syncProjectGitHub(id, { repo, token });
    const status = result.ok ? 200 : 400;
    return res.status(status).json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('syncGitHubById error:', err);
    return res.status(500).json({ ok: false, message: 'GitHub sync failed.' });
  }
}

export async function syncFigmaById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { figmaPublicUrl, figmaFileKey, token } = req.body ?? {};
    const result = await syncProjectFigma(id, { figmaPublicUrl, figmaFileKey, token });
    const status = result.ok ? 200 : 400;
    return res.status(status).json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('syncFigmaById error:', err);
    return res.status(500).json({ ok: false, message: 'Figma sync failed.' });
  }
}
