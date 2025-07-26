// src\utils\sitemapGenerators\postsSitemap.ts

import Post from '../../models/Post';
import { UrlEntry } from './types';

export const generatePostsSitemap = async (
  baseUrl: string,
  languages: string[]
): Promise<UrlEntry[]> => {
  const posts = await Post.find({
    status: 'published',
    isQuickPost: { $ne: true },
    isAiPrompt: { $ne: true },
  }).sort({ updatedAt: -1 });
  const urls: UrlEntry[] = [];

  for (const post of posts) {
    for (const lang of languages) {
      const translation = post.translations?.[lang];
      if (translation?.title?.trim()) {
        urls.push({
          loc: `${baseUrl}/${lang}/posts/${post.slug}`,
          lastmod: post.updatedAt?.toISOString(),
          changefreq: 'monthly',
          priority: 0.8,
        });
      }
    }
  }

  return urls;
};
