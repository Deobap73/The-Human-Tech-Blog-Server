// src/routes/sitemapRoute.ts

import { Router } from 'express';
import zlib from 'zlib';
import { generateSitemapXml } from '../utils/sitemapGenerator';

const router = Router();

/**
 * Gzipped sitemap XML for SEO
 */
router.get('/sitemap.xml.gz', async (_req, res) => {
  try {
    const xml = await generateSitemapXml();
    const gzipped = zlib.gzipSync(xml);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Disposition', 'inline; filename="sitemap.xml.gz"');

    res.status(200).send(gzipped);
  } catch (error) {
    console.error('❌ Failed to generate sitemap.xml.gz:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
