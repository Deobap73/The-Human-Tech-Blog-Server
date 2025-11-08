// /src/controllers/contactController.ts
'use strict';

import { Request, Response } from 'express';
import { sendMail } from '../utils/sendMail';

/**
 * Controller responsible for sending contact emails
 * - Ignores client subject for consistency
 * - Always prefixes "Message from blog: <name>"
 */
export const sendContactEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, contact, email, message, subject } = req.body as {
      name: string;
      contact?: string;
      email: string;
      message: string;
      subject?: string; // kept only to include in body if present
    };

    const fullName = String(name || '').trim() || 'Contact';

    // Force a stable subject
    const mailSubject = `Message from blog: ${fullName}`;

    // Plain-text body. If user typed a subject, we include it inside the body.
    const textLines: Array<string | null> = [
      `From : ${fullName}`,
      `Email: ${email}`,
      contact ? `Phone/Contact: ${contact}` : null,
      subject?.trim() ? `Subject: ${subject.trim()}` : null,
      '',
      'Message:',
      message,
    ];

    const text = textLines.filter(Boolean).join('\n');

    const result = await sendMail({
      subject: mailSubject,
      text,
      to: process.env.MAIL_DEFAULT_TO || process.env.SMTP_TO || 'owner@thehumantechblog.com',
      from: process.env.MAIL_FROM,
      replyTo: email,
    });

    if (!result.ok) {
      return res.status(502).json({
        success: false,
        message: 'Provider failed to send contact email',
        provider: result.provider,
        error: result.error,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Email sent successfully', id: result.id });
  } catch (_err) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal error while sending contact email' });
  }
};
