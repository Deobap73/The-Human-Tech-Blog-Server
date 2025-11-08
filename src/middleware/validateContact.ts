// /src/middleware/validateContact.ts
'use strict';

import { Request, Response, NextFunction } from 'express';

/**
 * Minimal validation for contact payload
 * Accepts the same shape you use on the portfolio:
 *  - firstName (required)
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
    const { firstName, email, message } = req.body as {
      firstName?: string;
      email?: string;
      message?: string;
    };

    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      return res.status(400).json({ success: false, message: 'firstName is required' });
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
