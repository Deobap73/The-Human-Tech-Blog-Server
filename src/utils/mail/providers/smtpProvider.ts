// /src/utils/mail/providers/smtpProvider.ts
'use strict';

import nodemailer from 'nodemailer';
import { env } from '../../../config/env';

interface VerifyResult {
  ok: boolean;
  info?: unknown;
  error?: string;
}

/**
 * Verifies SMTP connectivity and credentials.
 * Useful only for debugging platforms that may block SMTP egress.
 */
export const smtpVerifyPair = async (): Promise<VerifyResult> => {
  try {
    const host = env.SMTP_HOST;
    const port = Number(env.SMTP_PORT);
    const secure = String(env.SMTP_SECURE).toLowerCase() === 'true';
    const user = env.SMTP_USER;
    const pass = env.SMTP_PASS;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const info = await transporter.verify();
    return { ok: true, info };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown SMTP verify error';
    return { ok: false, error: msg };
  }
};
