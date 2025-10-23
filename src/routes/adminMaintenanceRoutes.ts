// /src/routes/adminMaintenanceRoutes.ts
'use strict';

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { env } from '../config/env';

const router = Router();

/**
 * Admin-only endpoint to rebuild Project text index.
 * Protection: ADMIN_SYNC_KEY must match query param or header.
 * Example:
 *   GET /api/admin/reindex-projects?key=YOUR_KEY
 */
router.get('/admin/reindex-projects', async (req: Request, res: Response) => {
  try {
    const provided = req.query.key || req.headers['x-admin-key'];
    if (provided !== env.ADMIN_SYNC_KEY) {
      return res.status(403).json({ message: 'Forbidden: invalid key' });
    }

    const collection = mongoose.connection.collection('projects');
    const indexes = await collection.indexes();

    const dropped: string[] = [];
    for (const idx of indexes) {
      const name = String(idx.name ?? '');
      const looksLegacy =
        name.includes('title_text') ||
        name.includes('excerpt_text') ||
        name.includes('tags_1') ||
        name.includes('title_text_excerpt_text_tags_1');
      if (looksLegacy && name !== 'Project_text_search') {
        try {
          await collection.dropIndex(name);
          dropped.push(name);
        } catch (err) {
          console.warn(`Could not drop index ${name}:`, (err as any)?.message);
        }
      }
    }

    await Project.syncIndexes();
    const finalIndexes = await collection.indexes();

    return res.status(200).json({
      ok: true,
      dropped,
      finalIndexes,
    });
  } catch (err) {
    console.error('Admin reindex error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to reindex projects', error: (err as any)?.message });
  }
});

export default router;
