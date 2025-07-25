// src/routes/sitemapRoute.ts

import { Router } from 'express';
import zlib from 'zlib';
import type { Response } from 'express';
import {
  generatePostsSitemap,
  generateQuickPostsSitemap,
  generatePromptsSitemap,
  generateCategoriesSitemap,
  generateSitemapIndex,
} from '../utils/sitemapGenerator';

const router = Router();

// Utilitário para enviar XML (opcionalmente gzipped)
const sendXmlResponse = (
  res: Response,
  xml: string,
  gzip = false,
  filename = 'sitemap.xml'
): Response => {
  if (gzip) {
    const gzipped = zlib.gzipSync(xml);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Disposition', `inline; filename="${filename}.gz"`);
    return res.status(200).send(gzipped); // ✅ return explícito
  }

  res.setHeader('Content-Type', 'application/xml');
  return res.status(200).send(xml); // ✅ return explícito
};

/**
 * Sitemap index (main file Google reads)
 */
router.get('/sitemap-index.xml', async (_req, res) => {
  try {
    const xml = await generateSitemapIndex();
    sendXmlResponse(res, xml);
  } catch (err) {
    console.error('❌ Error generating sitemap-index:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Individual sitemaps
 */
router.get('/sitemaps/posts-sitemap.xml', async (_req, res) => {
  try {
    const xml = await generatePostsSitemap();
    sendXmlResponse(res, xml);
  } catch (err) {
    console.error('❌ Error generating posts sitemap:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/sitemaps/quickposts-sitemap.xml', async (_req, res) => {
  try {
    const xml = await generateQuickPostsSitemap();
    sendXmlResponse(res, xml);
  } catch (err) {
    console.error('❌ Error generating quickposts sitemap:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/sitemaps/prompts-sitemap.xml', async (_req, res) => {
  try {
    const xml = await generatePromptsSitemap();
    sendXmlResponse(res, xml);
  } catch (err) {
    console.error('❌ Error generating prompts sitemap:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/sitemaps/categories-sitemap.xml', async (_req, res) => {
  try {
    const xml = await generateCategoriesSitemap();
    sendXmlResponse(res, xml);
  } catch (err) {
    console.error('❌ Error generating categories sitemap:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Gzipped version of sitemap-index.xml
 */
router.get('/sitemap.xml.gz', async (_req, res) => {
  try {
    const xml = await generateSitemapIndex();
    sendXmlResponse(res, xml, true, 'sitemap-index.xml');
  } catch (err) {
    console.error('❌ Error generating gzip sitemap index:', err);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
