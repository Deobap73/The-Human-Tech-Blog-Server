// src/utils/sitemapGenerators/staticSitemap.ts

import { UrlEntry } from './types';

export const generateStaticSitemap = (baseUrl: string, languages: string[]): UrlEntry[] => {
  const staticPages = ['', 'about', 'contact', 'posts'];

  const urls: UrlEntry[] = [];

  for (const lang of languages) {
    for (const page of staticPages) {
      const path = page ? `/${lang}/${page}` : `/${lang}`;
      urls.push({
        loc: `${baseUrl}${path}`,
        changefreq: page === '' || page === 'posts' ? 'daily' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // Root URL without lang prefix
  urls.unshift({
    loc: `${baseUrl}/`,
    changefreq: 'daily',
    priority: 1.0,
  });

  return urls;
};
