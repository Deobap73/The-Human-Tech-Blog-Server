// src/utils/sitemapGenerators/categoriesSitemap.ts

import Category from '../../models/Category';
import { UrlEntry } from './types';

export const generateCategoriesSitemap = async (
  baseUrl: string,
  languages: string[]
): Promise<UrlEntry[]> => {
  const categories = await Category.find().sort({ updatedAt: -1 });
  const urls: UrlEntry[] = [];

  for (const category of categories) {
    for (const lang of languages) {
      const translation = category.translations?.[lang];
      if (translation?.name?.trim()) {
        urls.push({
          loc: `${baseUrl}/${lang}/category/${category.slug}`,
          lastmod: category.updatedAt?.toISOString(),
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return urls;
};
