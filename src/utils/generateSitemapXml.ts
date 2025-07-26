// src/utils/generateSitemapXml.ts

import { UrlEntry } from './sitemapGenerators/types';
import { generatePostsSitemap } from './sitemapGenerators/postsSitemap';
import { generateQuickPostsSitemap } from './sitemapGenerators/quickpostsSitemap';
import { generatePromptsSitemap } from './sitemapGenerators/promptsSitemap';
import { generateCategoriesSitemap } from './sitemapGenerators/categoriesSitemap';
import { generateStaticSitemap } from './sitemapGenerators/staticSitemap';

/**
 * Generate full sitemap XML from all content types
 */
export const generateSitemapXml = async (): Promise<string> => {
  const baseUrl = 'https://thehumantechblog.com';
  const languages = ['en', 'pt', 'es', 'de'];

  const [posts, quickposts, prompts, categories, staticPages] = await Promise.all([
    generatePostsSitemap(baseUrl, languages),
    generateQuickPostsSitemap(baseUrl, languages),
    generatePromptsSitemap(baseUrl, languages),
    generateCategoriesSitemap(baseUrl, languages),
    generateStaticSitemap(baseUrl, languages),
  ]);

  const allUrls: UrlEntry[] = [...posts, ...quickposts, ...prompts, ...categories, ...staticPages];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    allUrls
      .map((u) => {
        return `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
      })
      .join('\n') +
    `\n</urlset>`;

  return xml;
};
