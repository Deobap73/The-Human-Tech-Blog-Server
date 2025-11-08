// /src/routes/contact.ts
'use strict';

import { Router } from 'express';
import { sendMail } from '../utils/sendMail';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    const to = process.env.MAIL_DEFAULT_TO || process.env.SMTP_TO || 'owner@thehumantechblog.com';

    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px">New contact message</h2>
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
      </div>
    `;

    const result = await sendMail({
      to,
      subject: subject?.trim() || 'New Contact Form Message',
      html,
      text: `From: ${name}\nEmail: ${email}\n\n${message}`,
      replyTo: email,
      from: process.env.MAIL_FROM,
    });

    if (!result.ok) {
      // Log para servidor
      console.error('[contact] provider error', {
        provider: result.provider,
        error: result.error,
        emailProviderEnv: process.env.EMAIL_PROVIDER,
        mailFromEnv: process.env.MAIL_FROM,
      });

      // Resposta com detalhe para debug
      return res.status(502).json({
        ok: false,
        error: 'Provider failed',
        provider: result.provider,
        details: result.error,
      });
    }

    return res.status(200).json({ ok: true, id: result.id });
  } catch (err) {
    console.error('[contact] internal error', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
});

export default router;

function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
