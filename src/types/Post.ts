// src\types\Post.ts
export interface Post {
  _id: string;
  translations: any;
  // ...adiciona campos necessários
}

export interface Translation {
  [lang: string]: {
    title?: string;
    name?: string;
    description?: string;
    content?: string;
  };
}

export interface PostForSitemap {
  slug: string;
  isQuickPost?: boolean;
  isAiPrompt?: boolean;
  updatedAt: Date;
  translations: Translation;
}

export interface CategoryForSitemap {
  slug: string;
  translations: Translation;
  updatedAt: Date;
}

export interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
}
