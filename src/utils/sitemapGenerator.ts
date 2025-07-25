// src/utils/sitemapGenerator.ts

import Post from '../models/Post';
import Category from '../models/Category';

const BASE_URL = 'https://thehumantechblog.com';
const LANGS = ['en', 'pt', 'es', 'de'];

function buildUrlsetXml(urls: { loc: string; lastmod?: string }[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
    )
    .join('\n')}\n</urlset>`;
}

export async function generatePostsSitemap(): Promise<string> {
  const posts = await Post.find({
    status: 'published',
    isQuickPost: false,
    isAiPrompt: false,
  }).sort({ updatedAt: -1 });
  const urls = posts.flatMap((post) =>
    LANGS.map((lang) => {
      const t = post.translations?.[lang];
      if (!t?.title?.trim()) return null;
      return {
        loc: `${BASE_URL}/${lang}/posts/${post.slug}`,
        lastmod: post.updatedAt.toISOString(),
      };
    }).filter(Boolean)
  );
  return buildUrlsetXml(urls as any[]);
}

export async function generateQuickPostsSitemap(): Promise<string> {
  const quicks = await Post.find({ status: 'published', isQuickPost: true }).sort({
    updatedAt: -1,
  });
  const urls = quicks.flatMap((post) =>
    LANGS.map((lang) => {
      const t = post.translations?.[lang];
      if (!t?.title?.trim()) return null;
      return {
        loc: `${BASE_URL}/${lang}/quickposts/${post.slug}`,
        lastmod: post.updatedAt.toISOString(),
      };
    }).filter(Boolean)
  );
  return buildUrlsetXml(urls as any[]);
}

export async function generatePromptsSitemap(): Promise<string> {
  const prompts = await Post.find({ status: 'published', isAiPrompt: true }).sort({
    updatedAt: -1,
  });
  const urls = prompts.flatMap((post) =>
    LANGS.map((lang) => {
      const t = post.translations?.[lang];
      if (!t?.title?.trim()) return null;
      return {
        loc: `${BASE_URL}/${lang}/aiprompts/${post.slug}`,
        lastmod: post.updatedAt.toISOString(),
      };
    }).filter(Boolean)
  );
  return buildUrlsetXml(urls as any[]);
}

export async function generateCategoriesSitemap(): Promise<string> {
  const categories = await Category.find().sort({ updatedAt: -1 });
  const urls = categories.flatMap((category) =>
    LANGS.map((lang) => {
      const t = category.translations?.[lang];
      if (!t?.name?.trim()) return null;
      return {
        loc: `${BASE_URL}/${lang}/category/${category.slug}`,
        lastmod: category.updatedAt.toISOString(),
      };
    }).filter(Boolean)
  );
  return buildUrlsetXml(urls as any[]);
}

export async function generateSitemapIndex(): Promise<string> {
  const sitemaps = [
    `${BASE_URL}/sitemaps/posts-sitemap.xml`,
    `${BASE_URL}/sitemaps/quickposts-sitemap.xml`,
    `${BASE_URL}/sitemaps/prompts-sitemap.xml`,
    `${BASE_URL}/sitemaps/categories-sitemap.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps
    .map(
      (loc) => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
    )
    .join('\n')}\n</sitemapindex>`;

  return xml;
}
