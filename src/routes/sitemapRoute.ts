// src/routes/sitemapRoute.ts

import { Router } from 'express';
import Post from '../models/Post';
import Category from '../models/Category';

const router = Router();

const baseUrl = 'https://thehumantechblog.com';
const languages = ['en', 'pt', 'es', 'de'];

type SitemapEntry = {
  loc: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
};

const generateSitemapXml = (entries: SitemapEntry[]): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n')}\n</urlset>`;
};

// ---- Static pages & Homepage sitemap ----
router.get('/sitemap-posts.xml', async (_req, res) => {
  try {
    const posts = await Post.find({
      status: 'published',
      isQuickPost: { $ne: true },
      isAiPrompt: { $ne: true },
    }).sort({ updatedAt: -1 });

    const entries: SitemapEntry[] = [];

    for (const post of posts) {
      for (const lang of languages) {
        const t = post.translations?.[lang];
        if (t?.title?.trim()) {
          entries.push({
            loc: `${baseUrl}/${lang}/posts/${post.slug}`,
            lastmod: post.updatedAt.toISOString(),
            changefreq: 'monthly',
            priority: 0.8,
          });
        }
      }
    }

    res.header('Content-Type', 'application/xml');
    res.send(generateSitemapXml(entries));
  } catch (err) {
    console.error('[SITEMAP POSTS] Failed:', err);
    res.sendStatus(500);
  }
});

router.get('/sitemap-quickposts.xml', async (_req, res) => {
  try {
    const posts = await Post.find({ status: 'published', isQuickPost: true }).sort({
      updatedAt: -1,
    });

    const entries: SitemapEntry[] = [];

    for (const post of posts) {
      for (const lang of languages) {
        const t = post.translations?.[lang];
        if (t?.title?.trim()) {
          entries.push({
            loc: `${baseUrl}/${lang}/quickposts/${post.slug}`,
            lastmod: post.updatedAt.toISOString(),
            changefreq: 'monthly',
            priority: 0.6,
          });
        }
      }
    }

    res.header('Content-Type', 'application/xml');
    res.send(generateSitemapXml(entries));
  } catch (err) {
    console.error('[SITEMAP QUICKPOSTS] Failed:', err);
    res.sendStatus(500);
  }
});

router.get('/sitemap-prompts.xml', async (_req, res) => {
  try {
    const posts = await Post.find({ status: 'published', isAiPrompt: true }).sort({
      updatedAt: -1,
    });

    const entries: SitemapEntry[] = [];

    for (const post of posts) {
      for (const lang of languages) {
        const t = post.translations?.[lang];
        if (t?.title?.trim()) {
          entries.push({
            loc: `${baseUrl}/${lang}/aiprompts/${post.slug}`,
            lastmod: post.updatedAt.toISOString(),
            changefreq: 'monthly',
            priority: 0.6,
          });
        }
      }
    }

    res.header('Content-Type', 'application/xml');
    res.send(generateSitemapXml(entries));
  } catch (err) {
    console.error('[SITEMAP PROMPTS] Failed:', err);
    res.sendStatus(500);
  }
});

router.get('/sitemap-categories.xml', async (_req, res) => {
  try {
    const categories = await Category.find().sort({ updatedAt: -1 });

    const entries: SitemapEntry[] = [];

    for (const cat of categories) {
      for (const lang of languages) {
        const t = cat.translations?.[lang];
        if (t?.name?.trim()) {
          entries.push({
            loc: `${baseUrl}/${lang}/category/${cat.slug}`,
            lastmod: cat.updatedAt.toISOString(),
            changefreq: 'monthly',
            priority: 0.6,
          });
        }
      }
    }

    res.header('Content-Type', 'application/xml');
    res.send(generateSitemapXml(entries));
  } catch (err) {
    console.error('[SITEMAP CATEGORIES] Failed:', err);
    res.sendStatus(500);
  }
});

router.get('/sitemap-index.xml', (_req, res) => {
  const sitemaps = [
    'sitemap-posts.xml',
    'sitemap-quickposts.xml',
    'sitemap-prompts.xml',
    'sitemap-categories.xml',
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps
    .map(
      (url) => `  <sitemap>
    <loc>${baseUrl}/${url}</loc>
  </sitemap>`
    )
    .join('\n')}\n</sitemapindex>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Optional fallback: /sitemap.xml → /sitemap-index.xml
router.get('/sitemap.xml', (_req, res) => {
  res.redirect(301, '/sitemap-index.xml');
});

export default router;
