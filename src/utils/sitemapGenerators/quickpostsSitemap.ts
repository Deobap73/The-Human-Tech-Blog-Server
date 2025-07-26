// src/utils/sitemapGenerators/quickpostsSitemap.ts

import Post from '../../models/Post';
import { UrlEntry } from './types';

export const generateQuickPostsSitemap = async (
  baseUrl: string,
  languages: string[]
): Promise<UrlEntry[]> => {
  const quickPosts = await Post.find({ status: 'published', isQuickPost: true }).sort({
    updatedAt: -1,
  });
  const urls: UrlEntry[] = [];

  for (const post of quickPosts) {
    for (const lang of languages) {
      const translation = post.translations?.[lang];
      if (translation?.title?.trim()) {
        urls.push({
          loc: `${baseUrl}/${lang}/quickposts/${post.slug}`,
          lastmod: post.updatedAt?.toISOString(),
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return urls;
};
