// ./src/types/Make.ts

'use strict';

export type MakePublishedWebhookPayload = {
  postId: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  isQuickPost: boolean;
  isAiPrompt: boolean;
  updatedAt: string;
};

export type MakePublishedWebhookBody = MakePublishedWebhookPayload & {
  makeSecret: string;
};

export type AutomationTranslationInput = {
  title: string;
  description: string;
  content: string;
};

type SlugsInput = string[] | string;

export type AutomationCreateDraftBody = {
  sheetId: string;
  sourceKey: string;

  contentKind: 'Post' | 'TechShort';
  size: 'short' | 'medium' | 'large';

  imageUrl: string;
  cta?: string;

  categorySlugs: SlugsInput;
  tagSlugs: SlugsInput;

  isAiPrompt?: boolean;

  translations: {
    en: AutomationTranslationInput;
    pt: AutomationTranslationInput;
    de: AutomationTranslationInput;
    es: AutomationTranslationInput;
  };
};

export type AutomationCreateDraftResponse =
  | {
      ok: true;
      postId: string;
      slug: string;
    }
  | {
      ok: false;
      error: string;
    };
