// /src/controllers/sitemapController.ts
'use strict';

import { Request, Response } from 'express';
import {
  generatePostsSitemapXml,
  generateQuickPostsSitemapXml,
  generatePromptsSitemapXml,
  generateCategoriesSitemapXml,
  generateStaticSitemapXml,
  generateProjectsSitemapXml, // ✅ novo import
  generateSitemapIndexXml,
} from '../utils/sitemapGenerator';

/**
 * Helper to send XML response
 */
const sendXml = (res: Response, xml: string): void => {
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
};

/**
 * Sitemap Index
 */
export const serveSitemapIndex = async (_req: Request, res: Response): Promise<void> => {
  const xml = generateSitemapIndexXml();
  sendXml(res, xml);
};

/**
 * Individual sitemaps
 */
export const servePostsSitemap = async (_req: Request, res: Response): Promise<void> => {
  const xml = await generatePostsSitemapXml();
  sendXml(res, xml);
};

export const serveQuickpostsSitemap = async (_req: Request, res: Response): Promise<void> => {
  const xml = await generateQuickPostsSitemapXml();
  sendXml(res, xml);
};

export const servePromptsSitemap = async (_req: Request, res: Response): Promise<void> => {
  const xml = await generatePromptsSitemapXml();
  sendXml(res, xml);
};

export const serveCategoriesSitemap = async (_req: Request, res: Response): Promise<void> => {
  const xml = await generateCategoriesSitemapXml();
  sendXml(res, xml);
};

export const serveStaticSitemap = async (_req: Request, res: Response): Promise<void> => {
  const xml = await generateStaticSitemapXml();
  sendXml(res, xml);
};

/**
 * ✅ New: Projects Sitemap
 * Lists public design/development projects for SEO (Figma, GitHub, etc.)
 */
export const serveProjectsSitemap = async (_req: Request, res: Response): Promise<void> => {
  const xml = await generateProjectsSitemapXml();
  sendXml(res, xml);
};
