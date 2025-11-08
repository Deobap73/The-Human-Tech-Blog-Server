// /src/controllers/contactController.ts
'use strict';

import { Request, Response } from 'express';
import { sendMail } from '../utils/sendMail';

/**
 * Controller responsible for sending contact emails
 * - Assumes body was validated by validateContact middleware
 * - Uses provider-agnostic sendMail() (Resend over HTTPS if EMAIL_PROVIDER=resend)
 */
export const sendContactEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { firstName, lastName, contact, email, message, subject } = req.body as {
      firstName: string;
      lastName?: string;
      contact?: string;
      email: string;
      message: string;
      subject?: string;
    };

    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const mailSubject = subject?.trim() || `Messege from blog: ${fullName || 'Contact'}`;

    // Plain-text body similar to your portfolio
    const text = [
      `From : ${fullName || 'Unknown'}`,
      `Email: ${email}`,
      contact ? `Phone/Contact: ${contact}` : null,
      '',
      'Message:',
      message,
    ]
      .filter(Boolean)
      .join('\n');

    const result = await sendMail({
      subject: mailSubject,
      text,
      // Recipient fallback
      to: process.env.MAIL_DEFAULT_TO || process.env.SMTP_TO || 'owner@thehumantechblog.com',
      // Stable verified sender if set
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
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal error while sending contact email' });
  }
};
