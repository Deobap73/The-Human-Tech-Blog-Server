// /src/routes/contact.ts

import { Router } from 'express';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
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
      from: `"${name}" <${email}>`,
      to: env.SMTP_TO,
      subject: subject || 'New Contact Form Message',
      text: message,
      replyTo: email,
    });

    return res.status(200).json({ ok: true }); // <-- return aqui
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email.' }); // <-- return aqui
  }
});

export default router;
