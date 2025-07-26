// src/routes/sitemapRoute.ts

import { Router, Request, Response } from 'express';
import zlib from 'zlib';
import {
  generatePostsSitemap,
  generateQuickPostsSitemap,
  generatePromptsSitemap,
  generateCategoriesSitemap,
  generateStaticSitemap,
  generateSitemapIndex,
} from '../controllers/sitemapController';

const router = Router();

const sendXmlResponse = (res: Response, xml: string, gzip = false, filename = 'sitemap.xml') => {
  const output = gzip ? zlib.gzipSync(xml) : xml;
  res.setHeader('Content-Type', 'application/xml');
  if (gzip) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  }
  res.status(200).send(output);
};

// Base config
const baseUrl = 'https://thehumantechblog.com';
const languages = ['en', 'pt', 'es', 'de'];

/** SITEMAP: POSTS */
router.get('/sitemap-posts.xml.gz', async (_req: Request, res: Response) => {
  try {
    const xml = await generatePostsSitemap(baseUrl, languages);
    sendXmlResponse(res, xml, true, 'sitemap-posts.xml.gz');
  } catch (error) {
    console.error('❌ Failed to generate posts sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

/** SITEMAP: QUICKPOSTS */
router.get('/sitemap-quickposts.xml.gz', async (_req: Request, res: Response) => {
  try {
    const xml = await generateQuickPostsSitemap(baseUrl, languages);
    sendXmlResponse(res, xml, true, 'sitemap-quickposts.xml.gz');
  } catch (error) {
    console.error('❌ Failed to generate quickposts sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

/** SITEMAP: PROMPTS */
router.get('/sitemap-prompts.xml.gz', async (_req: Request, res: Response) => {
  try {
    const xml = await generatePromptsSitemap(baseUrl, languages);
    sendXmlResponse(res, xml, true, 'sitemap-prompts.xml.gz');
  } catch (error) {
    console.error('❌ Failed to generate prompts sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

/** SITEMAP: CATEGORIES */
router.get('/sitemap-categories.xml.gz', async (_req: Request, res: Response) => {
  try {
    const xml = await generateCategoriesSitemap(baseUrl, languages);
    sendXmlResponse(res, xml, true, 'sitemap-categories.xml.gz');
  } catch (error) {
    console.error('❌ Failed to generate categories sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

/** SITEMAP: STATIC ROUTES */
router.get('/sitemap-static.xml.gz', async (_req: Request, res: Response) => {
  try {
    const xml = await generateStaticSitemap(baseUrl, languages);
    sendXmlResponse(res, xml, true, 'sitemap-static.xml.gz');
  } catch (error) {
    console.error('❌ Failed to generate static sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

/** SITEMAP: INDEX */
router.get('/sitemap-index.xml.gz', async (_req: Request, res: Response) => {
  try {
    const xml = await generateSitemapIndex(baseUrl);
    sendXmlResponse(res, xml, true, 'sitemap-index.xml.gz');
  } catch (error) {
    console.error('❌ Failed to generate sitemap index:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
