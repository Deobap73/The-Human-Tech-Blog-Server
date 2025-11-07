// /src/utils/mail/providers/resendProvider.ts
'use strict';

import { Resend } from 'resend';

export interface BuildResendClientResult {
  ok: boolean;
  client?: Resend;
  error?: string;
}

/**
 * Build a Resend client from environment variables with clear error messages.
 */
export const buildResendClient = (): BuildResendClientResult => {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      return {
        ok: false,
        error:
          'Missing RESEND_API_KEY. Define it as a secret in Railway/Render and in your local .env.',
      };
    }
    return { ok: true, client: new Resend(apiKey) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error creating Resend client',
    };
  }
};
