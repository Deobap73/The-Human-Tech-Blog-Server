// src/controllers/sitemapController.ts

import { Request, Response } from 'express';
import { generatePostsSitemapXml } from '../utils/sitemapGenerator';
import { generateQuickPostsSitemapXml } from '../utils/sitemapGenerator';
import { generatePromptsSitemapXml } from '../utils/sitemapGenerator';
import { generateCategoriesSitemapXml } from '../utils/sitemapGenerator';
import { generateStaticSitemapXml } from '../utils/sitemapGenerator';
import { generateSitemapIndexXml } from '../utils/sitemapGenerator';

const sendXml = (res: Response, xml: string) => {
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
};

export const serveSitemapIndex = async (_req: Request, res: Response) => {
  const xml = generateSitemapIndexXml();
  sendXml(res, xml);
};

export const servePostsSitemap = async (_req: Request, res: Response) => {
  const xml = await generatePostsSitemapXml();
  sendXml(res, xml);
};

export const serveQuickpostsSitemap = async (_req: Request, res: Response) => {
  const xml = await generateQuickPostsSitemapXml();
  sendXml(res, xml);
};

export const servePromptsSitemap = async (_req: Request, res: Response) => {
  const xml = await generatePromptsSitemapXml();
  sendXml(res, xml);
};

export const serveCategoriesSitemap = async (_req: Request, res: Response) => {
  const xml = await generateCategoriesSitemapXml();
  sendXml(res, xml);
};

export const serveStaticSitemap = async (_req: Request, res: Response) => {
  const xml = await generateStaticSitemapXml();
  sendXml(res, xml);
};
