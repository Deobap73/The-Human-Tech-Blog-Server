// src/utils/sitemapGenerator.ts

import Post from '../models/Post';
import Category from '../models/Category';

const baseUrl = 'https://thehumantechblog.com';
const languages = ['en', 'pt', 'es', 'de'];

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
}

function buildUrlSetXml(urls: UrlEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n')}\n</urlset>`;
}

// 🟦 Static pages
export async function generateStaticSitemapXml(): Promise<string> {
  const urls: UrlEntry[] = [
    { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
    ...languages.flatMap((lang) => [
      { loc: `${baseUrl}/${lang}`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/${lang}/about`, changefreq: 'monthly', priority: 0.8 },
      { loc: `${baseUrl}/${lang}/contact`, changefreq: 'monthly', priority: 0.8 },
      { loc: `${baseUrl}/${lang}/posts`, changefreq: 'daily', priority: 0.9 },
    ]),
  ];

  return buildUrlSetXml(urls);
}

// 🟨 Blog posts
export async function generatePostsSitemapXml(): Promise<string> {
  const posts = await Post.find({ status: 'published', isQuickPost: false, isAiPrompt: false }).sort({ updatedAt: -1 });

  const urls: UrlEntry[] = [];

  for (const post of posts) {
    for (const lang of languages) {
      const translation = post.translations?.[lang];
      if (translation?.title?.trim()) {
        urls.push({
          loc: `${baseUrl}/${lang}/posts/${post.slug}`,
          lastmod: post.updatedAt.toISOString(),
          changefreq: 'monthly',
          priority: 0.8,
        });
      }
    }
  }

  return buildUrlSetXml(urls);
}

// 🟧 QuickPosts
export async function generateQuickPostsSitemapXml(): Promise<string> {
  const posts = await Post.find({ status: 'published', isQuickPost: true }).sort({ updatedAt: -1 });

  const urls: UrlEntry[] = [];

  for (const post of posts) {
    for (const lang of languages) {
      const translation = post.translations?.[lang];
      if (translation?.title?.trim()) {
        urls.push({
          loc: `${baseUrl}/${lang}/quickposts/${post.slug}`,
          lastmod: post.updatedAt.toISOString(),
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return buildUrlSetXml(urls);
}

// 🟩 AI Prompts
export async function generatePromptsSitemapXml(): Promise<string> {
  const posts = await Post.find({ status: 'published', isAiPrompt: true }).sort({ updatedAt: -1 });

  const urls: UrlEntry[] = [];

  for (const post of posts) {
    for (const lang of languages) {
      const translation = post.translations?.[lang];
      if (translation?.title?.trim()) {
        urls.push({
          loc: `${baseUrl}/${lang}/aiprompts/${post.slug}`,
          lastmod: post.updatedAt.toISOString(),
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return buildUrlSetXml(urls);
}

// 🟥 Categories
export async function generateCategoriesSitemapXml(): Promise<string> {
  const categories = await Category.find().sort({ updatedAt: -1 });

  const urls: UrlEntry[] = [];

  for (const category of categories) {
    for (const lang of languages) {
      const translation = category.translations?.[lang];
      if (translation?.name?.trim()) {
        urls.push({
          loc: `${baseUrl}/${lang}/category/${category.slug}`,
          lastmod: category.updatedAt.toISOString(),
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return buildUrlSetXml(urls);
}

// 📁 Sitemap Index
export function generateSitemapIndexXml(): string {
  const today = new Date().toISOString().split('T')[0];

  const sitemapPaths = [
    'sitemap-posts.xml',
    'sitemap-quickposts.xml',
    'sitemap-prompts.xml',
    'sitemap-categories.xml',
    'sitemap-static.xml',
  ];

  const sitemaps = sitemapPaths
    .map(
      (path) => `  <sitemap>
    <loc>${baseUrl}/${path}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>`;
}
