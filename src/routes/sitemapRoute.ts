// /src/routes/sitemapRoute.ts

import { Router } from 'express';
import Post from '../models/Post';

const router = Router();

type SitemapEntry = {
  loc: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
};

/**
 * Generate XML sitemap dynamically (multilingual, QuickPosts, Prompts)
 */
router.get('/sitemap.xml', async (_req, res) => {
  try {
    const baseUrl = 'https://thehumantechblog.com';

    const posts = await Post.find({
      status: 'published',
    }).sort({ updatedAt: -1 });

    const staticUrls: SitemapEntry[] = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/en`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/pt`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/es`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/de`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/en/about`, changefreq: 'monthly', priority: 0.8 },
      { loc: `${baseUrl}/en/contact`, changefreq: 'monthly', priority: 0.8 },
      { loc: `${baseUrl}/en/posts/`, changefreq: 'daily', priority: 0.9 },
    ];

    const languages = ['en', 'pt', 'es', 'de'];

    const dynamicUrls: SitemapEntry[] = [];

    for (const post of posts) {
      const { slug, isQuickPost, isAiPrompt, updatedAt, translations } = post;

      for (const lang of languages) {
        const translation = translations?.[lang];
        if (translation?.title?.trim()) {
          let path = 'posts';
          if (isQuickPost) path = 'quickposts';
          if (isAiPrompt) path = 'aiprompts';

          dynamicUrls.push({
            loc: `${baseUrl}/${lang}/${path}/${slug}`,
            lastmod: updatedAt.toISOString(),
            changefreq: 'monthly',
            priority: isQuickPost || isAiPrompt ? 0.6 : 0.8,
          });
        }
      }
    }

    const allUrls: SitemapEntry[] = [...staticUrls, ...dynamicUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls
      .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
      )
      .join('\n')}\n</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
