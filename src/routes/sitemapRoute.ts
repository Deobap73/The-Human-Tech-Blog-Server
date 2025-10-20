// /src/routes/sitemapRoute.ts
'use strict';

import { Router } from 'express';
import {
  serveSitemapIndex,
  servePostsSitemap,
  serveQuickpostsSitemap,
  servePromptsSitemap,
  serveCategoriesSitemap,
  serveStaticSitemap,
  serveProjectsSitemap,
} from '../controllers/sitemapController';

const router = Router();

/**
 * SEO-friendly alias: many crawlers look for /sitemap.xml directly.
 * It simply serves the same sitemap index.
 */
router.get('/sitemap.xml', serveSitemapIndex);

// Sitemap Index
router.get('/sitemap-index.xml', serveSitemapIndex);

// Individual sitemaps
router.get('/sitemap-posts.xml', servePostsSitemap);
router.get('/sitemap-quickposts.xml', serveQuickpostsSitemap);
router.get('/sitemap-prompts.xml', servePromptsSitemap);
router.get('/sitemap-categories.xml', serveCategoriesSitemap);
router.get('/sitemap-static.xml', serveStaticSitemap);

// ✅ New: Projects sitemap (public projects only)
router.get('/sitemap-projects.xml', serveProjectsSitemap);

export default router;
