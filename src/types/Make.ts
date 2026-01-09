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

/**
 * Final body sent to Make.
 * We include a shared secret in the body to allow filtering in Make
 * without relying on request headers.
 */
export type MakePublishedWebhookBody = MakePublishedWebhookPayload & {
  makeSecret: string;
};
