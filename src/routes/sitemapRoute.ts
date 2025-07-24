// /src/routes/sitemapRoute.ts

import { Router } from 'express';
import Post from '../models/Post';
import Category from '../models/Category';

const router = Router();

type SitemapEntry = {
  loc: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
};

router.get('/sitemap.xml.gz', async (_req, res) => {
  try {
    const baseUrl = 'https://thehumantechblog.com';
    const languages = ['en', 'pt', 'es', 'de'];

    const posts = await Post.find({ status: 'published' }).sort({ updatedAt: -1 });
    const categories = await Category.find().sort({ updatedAt: -1 });

    const staticUrls: SitemapEntry[] = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
      ...languages.map((lang) => ({
        loc: `${baseUrl}/${lang}`,
        changefreq: 'daily',
        priority: 1.0,
      })),
      ...languages.map((lang) => ({
        loc: `${baseUrl}/${lang}/about`,
        changefreq: 'monthly',
        priority: 0.8,
      })),
      ...languages.map((lang) => ({
        loc: `${baseUrl}/${lang}/contact`,
        changefreq: 'monthly',
        priority: 0.8,
      })),
      ...languages.map((lang) => ({
        loc: `${baseUrl}/${lang}/posts/`,
        changefreq: 'daily',
        priority: 0.9,
      })),
    ];

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

    for (const category of categories) {
      const { slug, translations, updatedAt } = category;

      for (const lang of languages) {
        const translation = translations?.[lang];
        if (translation?.name?.trim()) {
          dynamicUrls.push({
            loc: `${baseUrl}/${lang}/category/${slug}`,
            lastmod: updatedAt.toISOString(),
            changefreq: 'monthly',
            priority: 0.6,
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
