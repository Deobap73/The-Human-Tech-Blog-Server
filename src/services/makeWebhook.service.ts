// ./src/services/makeWebhook.service.ts

'use strict';

import { env } from '../config/env';
import type { MakePublishedWebhookPayload } from '../types/Make';

/**
 * Sends a webhook to Make when a post becomes published.
 * This must never break the main request flow.
 */

function getTimeoutMs(): number {
  return 3500;
}

function isConfigured(): boolean {
  return Boolean((env.MAKE_PUBLISHED_WEBHOOK_URL || '').trim());
}

export async function sendMakePublishedWebhook(
  payload: MakePublishedWebhookPayload
): Promise<boolean> {
  const url = (env.MAKE_PUBLISHED_WEBHOOK_URL || '').trim();
  const secret = (env.MAKE_PUBLISHED_WEBHOOK_SECRET || '').trim();

  if (!isConfigured()) {
    console.warn('[makeWebhook] MAKE_PUBLISHED_WEBHOOK_URL not configured. Skipping.');
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-make-secret': secret,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[makeWebhook] Failed:', {
        status: res.status,
        response: text ? text.slice(0, 500) : '[no body]',
      });
      return false;
    }

    console.log('[makeWebhook] Sent successfully:', {
      postId: payload.postId,
      slug: payload.slug,
    });

    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[makeWebhook] Error:', message);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
