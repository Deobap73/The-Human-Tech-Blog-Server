// src/utils/sitemapGenerators/promptsSitemap.ts

import Post from '../../models/Post';
import { UrlEntry } from './types';

export const generatePromptsSitemap = async (
  baseUrl: string,
  languages: string[]
): Promise<UrlEntry[]> => {
  const prompts = await Post.find({ status: 'published', isAiPrompt: true }).sort({
    updatedAt: -1,
  });
  const urls: UrlEntry[] = [];

  for (const prompt of prompts) {
    for (const lang of languages) {
      const translation = prompt.translations?.[lang];
      if (translation?.title?.trim()) {
        urls.push({
          loc: `${baseUrl}/${lang}/aiprompts/${prompt.slug}`,
          lastmod: prompt.updatedAt?.toISOString(),
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }
  }

  return urls;
};
