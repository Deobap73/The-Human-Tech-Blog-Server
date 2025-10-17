// /src/utils/sitemapIndexGenerator.ts
'use strict';

/**
 * Generate an XML sitemap index string for the provided sitemap file names.
 * - Strict TS
 * - Uses BASE_URL env when available
 * - ISO date (YYYY-MM-DD) for <lastmod>
 */
export const generateSitemapIndexXml = (
  sitemapFiles: string[] = [
    'sitemap-posts.xml',
    'sitemap-quickposts.xml',
    'sitemap-prompts.xml',
    'sitemap-categories.xml',
    'sitemap-static.xml',
    // You can add 'sitemap-projects.xml' as soon as it's generated
  ],
  baseUrlEnv?: string,
  lastModDate?: string
): string => {
  const rawBase = (baseUrlEnv || process.env.BASE_URL || 'https://thehumantechblog.com').trim();
  const baseUrl = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

  const today = (lastModDate || new Date().toISOString().split('T')[0]).trim();

  const entries = sitemapFiles
    .filter((file) => typeof file === 'string' && file.length > 0)
    .map((file) => {
      return `  <sitemap>
    <loc>${baseUrl}/${file}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
    })
    .join('\n');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries +
    `\n</sitemapindex>`;

  return xml;
};
