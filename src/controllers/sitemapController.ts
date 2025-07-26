// src/controllers/sitemapController.ts

import { Request, Response } from 'express';
import zlib from 'zlib';
import { generatePostsSitemap } from '../utils/sitemapGenerators/postsSitemap';
import { generateQuickPostsSitemap } from 'src/utils/sitemapGenerators/quickpostsSitemap';
import { generatePromptsSitemap } from '../utils/sitemapGenerators/promptsSitemap';
import { generateCategoriesSitemap } from '../utils/sitemapGenerators/categoriesSitemap';
import { generateStaticSitemap } from '../utils/sitemapGenerators/staticSitemap';
import { UrlEntry } from '../utils/sitemapGenerators/types';

const baseUrl = 'https://thehumantechblog.com';
const languages = ['en', 'pt', 'es', 'de'];

const buildXml = (urls: UrlEntry[]): string => {
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
};

const sendXmlResponse = (res: Response, xml: string, gzip = false, filename = 'sitemap.xml') => {
  if (gzip) {
    const gzipped = zlib.gzipSync(xml);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Disposition', `inline; filename="${filename}.gz"`);
    return res.status(200).send(gzipped);
  }

  res.setHeader('Content-Type', 'application/xml');
  return res.status(200).send(xml);
};

export const sitemapPosts = async (_req: Request, res: Response) => {
  const urls = await generatePostsSitemap(baseUrl, languages);
  const xml = buildXml(urls);
  return sendXmlResponse(res, xml, true, 'sitemap-posts.xml');
};

export const sitemapQuickPosts = async (_req: Request, res: Response) => {
  const urls = await generateQuickPostsSitemap(baseUrl, languages);
  const xml = buildXml(urls);
  return sendXmlResponse(res, xml, true, 'sitemap-quickposts.xml');
};

export const sitemapPrompts = async (_req: Request, res: Response) => {
  const urls = await generatePromptsSitemap(baseUrl, languages);
  const xml = buildXml(urls);
  return sendXmlResponse(res, xml, true, 'sitemap-prompts.xml');
};

export const sitemapCategories = async (_req: Request, res: Response) => {
  const urls = await generateCategoriesSitemap(baseUrl, languages);
  const xml = buildXml(urls);
  return sendXmlResponse(res, xml, true, 'sitemap-categories.xml');
};

export const sitemapStatic = (_req: Request, res: Response) => {
  const urls = generateStaticSitemap(baseUrl, languages);
  const xml = buildXml(urls);
  return sendXmlResponse(res, xml, true, 'sitemap-static.xml');
};
