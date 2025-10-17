// /src/utils/sitemapGenerators/projectsSitemap.ts
'use strict';

import { Project } from '../../models/Project';
import { UrlEntry } from './types';

/**
 * Build sitemap entries for public projects.
 */
export async function buildProjectsSitemapEntries(baseUrl: string): Promise<UrlEntry[]> {
  try {
    const projects = await Project.find({ isPublic: true }).select('slug updatedAt').lean();
    return projects.map((p) => ({
      loc: `${baseUrl}/projects/${p.slug}`,
      lastmod: p.updatedAt?.toISOString?.() || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}
