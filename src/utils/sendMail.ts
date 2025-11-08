// /src/utils/sendMail.ts
'use strict';

import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { buildResendClient } from './mail/providers/resendProvider';
import type { CreateEmailOptions } from 'resend';

export interface MailAddress {
  name?: string;
  email: string;
}

export interface SendMailOptions {
  to?: string | string[] | MailAddress | MailAddress[];
  from?: string | MailAddress;
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[] | MailAddress | MailAddress[];
  bcc?: string | string[] | MailAddress | MailAddress[];
  replyTo?: string | string[] | MailAddress | MailAddress[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    type?: string;
  }>;
}

export interface SendMailResult {
  ok: boolean;
  id?: string;
  provider?: 'resend' | 'smtp' | 'unknown' | string;
  error?: string;
}

/**
 * Public API: always returns a value.
 */
export const sendMail = async (options: SendMailOptions): Promise<SendMailResult> => {
  try {
    const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();

    if (provider === 'resend') {
      return await sendWithResend(options);
    }
    if (provider === 'smtp' || provider === '') {
      return await sendWithSmtp(options);
    }

    return {
      ok: false,
      provider,
      error: `EMAIL_PROVIDER='${provider}' not supported. Use 'resend' or 'smtp'.`,
    };
  } catch (err) {
    return {
      ok: false,
      provider: 'unknown',
      error: err instanceof Error ? err.message : 'Unknown error while sending email',
    };
  }
};

/**
 * Legacy wrapper: throws on failure, returns void on success.
 */
export const sendMailLegacy = async (options: SendMailOptions): Promise<void> => {
  const result = await sendMail(options);
  if (!result.ok) {
    throw new Error(result.error || 'Failed to send email');
  }
  return;
};

/* -------------------------- Provider: Resend --------------------------- */

const sendWithResend = async (options: SendMailOptions): Promise<SendMailResult> => {
  try {
    const { ok, client, error } = buildResendClient();
    if (!ok || !client) {
      return { ok: false, provider: 'resend', error: error || 'Failed to init Resend client' };
    }

    const from =
      (typeof options.from === 'string' ? options.from : options.from?.email) ||
      process.env.MAIL_FROM ||
      '';

    if (!from) {
      return {
        ok: false,
        provider: 'resend',
        error:
          'Missing sender. Provide options.from or set MAIL_FROM (e.g. "The Human Tech Blog <noreply@thehumantechblog.com>").',
      };
    }

    let to = options.to;
    if (!to || (Array.isArray(to) && (to as any[]).length === 0)) {
      to = process.env.MAIL_DEFAULT_TO || env.SMTP_TO || '';
    }
    if (!to || (Array.isArray(to) && (to as any[]).length === 0)) {
      return { ok: false, provider: 'resend', error: 'Missing recipient (to).' };
    }

    if (!options.subject?.trim()) {
      return { ok: false, provider: 'resend', error: 'Missing subject.' };
    }
    if (!options.html && !options.text) {
      return { ok: false, provider: 'resend', error: 'Provide at least one of { html, text }.' };
    }

    // Build payload in html/text branches to avoid template overload
    let payload: CreateEmailOptions;
    if (options.html) {
      payload = {
        from,
        to: to as any,
        subject: options.subject,
        html: options.html,
      };
    } else {
      payload = {
        from,
        to: to as any,
        subject: options.subject,
        text: options.text as string,
      };
    }

    // Optional fields
    if (options.cc) (payload as any).cc = options.cc as any;
    if (options.bcc) (payload as any).bcc = options.bcc as any;
    if (options.replyTo) (payload as any).replyTo = options.replyTo as any;

    if (options.attachments && options.attachments.length > 0) {
      (payload as any).attachments = options.attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        path: a.path,
        contentType: a.type, // map local "type" -> Resend "contentType"
      }));
    }

    const { data, error: sendError } = await client.emails.send(payload);

    if (sendError) {
      // Server log for diagnosis
      console.error('[sendMail][resend] error', {
        name: (sendError as any)?.name,
        message: sendError?.message,
        statusCode: (sendError as any)?.statusCode,
      });
      return {
        ok: false,
        provider: 'resend',
        error: sendError?.message || 'Unknown Resend error',
      };
    }

    if (data?.id) {
      return { ok: true, id: data.id, provider: 'resend' };
    }

    return {
      ok: false,
      provider: 'resend',
      error: 'Resend did not return a message id. Check your Resend dashboard/logs.',
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown Resend error';
    return { ok: false, provider: 'resend', error: message };
  }
};

/* --------------------------- Provider: SMTP ---------------------------- */

const sendWithSmtp = async (options: SendMailOptions): Promise<SendMailResult> => {
  try {
    const host = env.SMTP_HOST;
    const portRaw = env.SMTP_PORT;
    const secureRaw = env.SMTP_SECURE;
    const user = env.SMTP_USER;
    const pass = env.SMTP_PASS;

    if (!host || !portRaw || !secureRaw || !user || !pass) {
      return {
        ok: false,
        provider: 'smtp',
        error:
          'SMTP is not fully configured. Please set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS.',
      };
    }

    const port = Number(portRaw);
    const secure = String(secureRaw).toLowerCase() === 'true';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const from =
      (typeof options.from === 'string' ? options.from : options.from?.email) ||
      process.env.MAIL_FROM ||
      user;

    let to = options.to;
    if (!to || (Array.isArray(to) && (to as any[]).length === 0)) {
      to = env.SMTP_TO || process.env.MAIL_DEFAULT_TO || '';
    }
    if (!to || (Array.isArray(to) && (to as any[]).length === 0)) {
      return { ok: false, provider: 'smtp', error: 'Missing recipient (to).' };
    }

    if (!options.subject?.trim()) {
      return { ok: false, provider: 'smtp', error: 'Missing subject.' };
    }
    if (!options.html && !options.text) {
      return { ok: false, provider: 'smtp', error: 'Provide at least one of { html, text }.' };
    }

    const info = await transporter.sendMail({
      from,
      to: to as any,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc as any,
      bcc: options.bcc as any,
      replyTo: options.replyTo as any,
      attachments: options.attachments as any,
    });

    if (info?.messageId) {
      return { ok: true, id: info.messageId, provider: 'smtp' };
    }
    return {
      ok: false,
      provider: 'smtp',
      error: 'SMTP did not return a messageId. Check SMTP logs.',
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown SMTP error';
    return { ok: false, provider: 'smtp', error: message };
  }
};
