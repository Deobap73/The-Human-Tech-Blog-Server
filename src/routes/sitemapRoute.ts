// src/routes/sitemapRoute.ts

import { Router } from 'express';
import {
  serveSitemapIndex,
  servePostsSitemap,
  serveQuickpostsSitemap,
  servePromptsSitemap,
  serveCategoriesSitemap,
  serveStaticSitemap,
} from '../controllers/sitemapController';

const router = Router();

// Sitemap Index (sem gzip)
router.get('/sitemap-index.xml', serveSitemapIndex);

// Sitemaps individuais (sem gzip)
router.get('/sitemap-posts.xml', servePostsSitemap);
router.get('/sitemap-quickposts.xml', serveQuickpostsSitemap);
router.get('/sitemap-prompts.xml', servePromptsSitemap);
router.get('/sitemap-categories.xml', serveCategoriesSitemap);
router.get('/sitemap-static.xml', serveStaticSitemap);

export default router;
