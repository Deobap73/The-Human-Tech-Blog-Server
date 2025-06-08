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
      port: Number(env.SMTP_PORT),
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name} via The Human Tech Blog" <contact@thehumantechblog.com>`,
      to: env.SMTP_TO,
      subject: subject || 'New Contact Form Message',
      text: `From: ${name}\nEmail: ${email}\n\n${message}`,
      replyTo: email,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
});

export default router;
