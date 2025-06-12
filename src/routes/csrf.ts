// src/routes/csrf.ts

import { Router } from 'express';

const router = Router();

/**
 * Legacy route for CSRF token retrieval (for compatibility)
 * You can fetch with GET /api/csrf-token
 */
router.get('/csrf-token', (req, res) => {
  // Method csrfToken() is provided by csurf middleware
  res.json({ csrfToken: req.csrfToken() });
});

export default router;
