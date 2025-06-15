// The-Human-Tech-Blog-Server\src\utils\sendMail.ts

import nodemailer from 'nodemailer';
import { env } from '../config/env';

/**
 * Strongly typed mail options for clarity and type safety.
 */
interface SendMailOptions {
  from: string;
  subject: string;
  text: string;
}

/**
 * Sends an email using Nodemailer and environment SMTP config.
 * @param {SendMailOptions} options - Mail sending options (from, subject, text).
 * @returns {Promise<void>} - Resolves if sent successfully, throws error otherwise.
 */
export const sendMail = async ({ from, subject, text }: SendMailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from,
    to: env.SMTP_TO,
    subject,
    text,
  });
};
