// /src/routes/contact.ts
'use strict';

import { Router } from 'express';
import { sendContactEmail } from '../controllers/contactController';
import { validateContact } from '../middleware/validateContact';
import { smtpVerifyPair } from '../utils/mail/providers/smtpProvider';

const router = Router();

/**
 * POST /api/contact
 * - Same flow as your portfolio server: validate -> controller
 */
router.post('/', validateContact, sendContactEmail);

/**
 * GET /api/contact/debug/verify
 * - SMTP verify (optional, helps you diagnose if the platform blocks SMTP)
 */
router.get('/debug/verify', async (_req, res) => {
  const r = await smtpVerifyPair();
  if (r.ok) return res.json(r);
  return res.status(500).json(r);
});

/**
 * GET /api/contact/debug/provider
 * - Quick view of provider envs to confirm Resend/From settings at runtime
 */
router.get('/debug/provider', (_req, res) => {
  res.json({
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || null,
    hasRESEND_KEY: Boolean(process.env.RESEND_API_KEY),
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_TO: process.env.MAIL_DEFAULT_TO || process.env.SMTP_TO || null,
  });
});

export default router;
