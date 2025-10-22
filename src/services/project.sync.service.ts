// /src/services/project.sync.service.ts
'use strict';

import { Project } from '../models/Project';
import { buildFigmaEmbedUrl, getFigmaFileMeta } from './integrations/figma.api';
import { getRepoMeta } from './integrations/github.api';
import { metaCache } from './cache/meta.cache';

// TTLs (tune as needed)
const GITHUB_TTL_MS = 60 * 60 * 1000; // 1h
const FIGMA_TTL_MS = 60 * 60 * 1000; // 1h

export async function syncProjectFigma(
  projectId: string,
  opts: { figmaPublicUrl?: string; figmaFileKey?: string; token?: string }
) {
  try {
    const doc = await Project.findById(projectId);
    if (!doc) return { ok: false, message: 'Project not found.' };

    const token = opts.token || process.env.FIGMA_TOKEN || '';
    if (!token) return { ok: false, message: 'FIGMA_TOKEN missing.' };

    if (opts.figmaPublicUrl) {
      doc.links.figma = opts.figmaPublicUrl;
      doc.links.figmaEmbedUrl = buildFigmaEmbedUrl(opts.figmaPublicUrl);
    }

    const fileKey = (opts.figmaFileKey || doc.meta?.figma?.fileKey || '').trim();
    if (!fileKey && !opts.figmaPublicUrl) {
      await doc.save();
      return { ok: true, project: doc.toObject(), message: 'Saved Figma public URL (no fileKey).' };
    }

    if (fileKey) {
      const cacheKey = `figma:${fileKey}`;
      let meta: Awaited<ReturnType<typeof getFigmaFileMeta>> | undefined = metaCache.get(
        cacheKey
      ) as any;

      if (!meta) {
        meta = await getFigmaFileMeta(fileKey, token);
        if (meta) metaCache.set(cacheKey, meta, FIGMA_TTL_MS);
      }

      if (meta) {
        doc.meta = doc.meta || {};
        doc.meta.figma = {
          ...(doc.meta.figma || {}),
          fileKey,
          fileName: meta.name,
          thumbnailUrl: meta.thumbnailUrl || doc.meta.figma?.thumbnailUrl,
          lastModified: meta.lastModified,
        };
        if (!doc.coverImage && meta.thumbnailUrl) {
          doc.coverImage = meta.thumbnailUrl;
        }
      }
    }

    await doc.save();
    return { ok: true, project: doc.toObject() };
  } catch (err) {
    return { ok: false, message: 'Figma sync failed.' };
  }
}

export async function syncProjectGitHub(
  projectId: string,
  opts: { repo?: string; token?: string }
) {
  try {
    const doc = await Project.findById(projectId);
    if (!doc) return { ok: false, message: 'Project not found.' };

    const repo = (opts.repo || doc.meta?.github?.repo || '').trim();
    if (!repo) return { ok: false, message: 'repo missing (owner/name).' };

    const token = opts.token || process.env.GITHUB_TOKEN || '';
    const cacheKey = `gh:${repo}`;
    let meta: Awaited<ReturnType<typeof getRepoMeta>> | undefined = metaCache.get(cacheKey) as any;

    if (!meta) {
      meta = await getRepoMeta(repo, token);
      if (meta) metaCache.set(cacheKey, meta, GITHUB_TTL_MS);
    }

    if (!meta) return { ok: false, message: 'GitHub meta not found.' };

    doc.meta = doc.meta || {};
    doc.meta.github = {
      ...(doc.meta.github || {}),
      repo,
      stars:
        typeof meta.stargazers_count === 'number' ? meta.stargazers_count : doc.meta.github?.stars,
      lastCommitAt: meta.pushed_at || doc.meta.github?.lastCommitAt,
      topics: Array.isArray(meta.topics) ? meta.topics : doc.meta.github?.topics,
      description: meta.description || doc.meta.github?.description,
    };

    if (!doc.excerpt && meta.description) doc.excerpt = meta.description;

    await doc.save();
    return { ok: true, project: doc.toObject() };
  } catch (err) {
    return { ok: false, message: 'GitHub sync failed.' };
  }
}
