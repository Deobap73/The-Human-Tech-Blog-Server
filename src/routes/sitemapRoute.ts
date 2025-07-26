// src/routes/sitemapRoute.ts

import { Router, Response } from 'express';
import zlib from 'zlib';
import {
  generatePostsSitemapXml,
  generateQuickPostsSitemapXml,
  generatePromptsSitemapXml,
  generateCategoriesSitemapXml,
  generateStaticSitemapXml,
  generateSitemapIndexXml,
} from '../utils/sitemapGenerator';

const router = Router();

/**
 * Helper para enviar XML (com ou sem gzip)
 */
const sendXmlResponse = (res: Response, xml: string, gzip = false, filename = 'sitemap.xml') => {
  if (gzip) {
    const gzipped = zlib.gzipSync(xml);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Disposition', `inline; filename="${filename}.gz"`);
    return res.status(200).send(gzipped);
  }

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  return res.status(200).send(xml);
};

/**
 * Rotas para os diferentes sitemaps
 */
router.get('/sitemap-index.xml', (_req, res) => {
  const xml = generateSitemapIndexXml();
  return sendXmlResponse(res, xml, false, 'sitemap-index.xml');
});

router.get('/sitemap-index.xml.gz', (_req, res) => {
  const xml = generateSitemapIndexXml();
  return sendXmlResponse(res, xml, true, 'sitemap-index.xml');
});

router.get('/sitemap-posts.xml.gz', async (_req, res) => {
  const xml = await generatePostsSitemapXml();
  return sendXmlResponse(res, xml, true, 'sitemap-posts.xml');
});

router.get('/sitemap-quickposts.xml.gz', async (_req, res) => {
  const xml = await generateQuickPostsSitemapXml();
  return sendXmlResponse(res, xml, true, 'sitemap-quickposts.xml');
});

router.get('/sitemap-prompts.xml.gz', async (_req, res) => {
  const xml = await generatePromptsSitemapXml();
  return sendXmlResponse(res, xml, true, 'sitemap-prompts.xml');
});

router.get('/sitemap-categories.xml.gz', async (_req, res) => {
  const xml = await generateCategoriesSitemapXml();
  return sendXmlResponse(res, xml, true, 'sitemap-categories.xml');
});

router.get('/sitemap-static.xml.gz', async (_req, res) => {
  const xml = await generateStaticSitemapXml();
  return sendXmlResponse(res, xml, true, 'sitemap-static.xml');
});

export default router;
