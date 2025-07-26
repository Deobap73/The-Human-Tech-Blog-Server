// src/controllers/sitemapController.ts

import { Request, Response } from 'express';
import { generateSitemapXmlFromEntries } from '../utils/sitemapGenerator';
import { generatePostsSitemap } from '../utils/sitemapGenerators/postsSitemap';
import { generateQuickpostsSitemap } from '../utils/sitemapGenerators/quickpostsSitemap';
import { generatePromptsSitemap } from '../utils/sitemapGenerators/promptsSitemap';
import { generateCategoriesSitemap } from '../utils/sitemapGenerators/categoriesSitemap';
import { generateStaticSitemap } from '../utils/sitemapGenerators/staticSitemap';
import { generateSitemapIndex } from '../utils/sitemapIndexGenerator';

const baseUrl = 'https://thehumantechblog.com';
const languages = ['en', 'pt', 'de', 'es'];

const sendXml = (res: Response, xml: string) => {
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
};

export const serveSitemapIndex = async (_req: Request, res: Response) => {
  const xml = await generateSitemapIndex(baseUrl);
  sendXml(res, xml);
};

export const servePostsSitemap = async (_req: Request, res: Response) => {
  const entries = await generatePostsSitemap(baseUrl, languages);
  const xml = generateSitemapXmlFromEntries(entries);
  sendXml(res, xml);
};

export const serveQuickpostsSitemap = async (_req: Request, res: Response) => {
  const entries = await generateQuickpostsSitemap(baseUrl, languages);
  const xml = generateSitemapXmlFromEntries(entries);
  sendXml(res, xml);
};

export const servePromptsSitemap = async (_req: Request, res: Response) => {
  const entries = await generatePromptsSitemap(baseUrl, languages);
  const xml = generateSitemapXmlFromEntries(entries);
  sendXml(res, xml);
};

export const serveCategoriesSitemap = async (_req: Request, res: Response) => {
  const entries = await generateCategoriesSitemap(baseUrl, languages);
  const xml = generateSitemapXmlFromEntries(entries);
  sendXml(res, xml);
};

export const serveStaticSitemap = async (_req: Request, res: Response) => {
  const entries = await generateStaticSitemap(baseUrl, languages);
  const xml = generateSitemapXmlFromEntries(entries);
  sendXml(res, xml);
};
