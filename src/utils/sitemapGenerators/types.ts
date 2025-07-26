// src/utils/sitemapGenerators/types.ts

export interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}
