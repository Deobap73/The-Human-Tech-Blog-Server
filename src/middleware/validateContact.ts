// /src/middleware/validateContact.ts
'use strict';

import { Request, Response, NextFunction } from 'express';

/**
 * Minimal validation for contact payload
 * Accepts the same shape you use on the portfolio:
 *  - name (required)
 *  - lastName (optional)
 *  - contact (optional)
 *  - email (required, basic format check)
 *  - message (required)
 *  - subject (optional)
 */
export const validateContact = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const { name, email, message } = req.body as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }
    if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    return next();
  } catch (_err) {
    return res.status(400).json({ success: false, message: 'Invalid contact payload' });
  }
};
