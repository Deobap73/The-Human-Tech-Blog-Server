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
