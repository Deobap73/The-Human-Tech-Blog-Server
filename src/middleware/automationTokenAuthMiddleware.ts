// /src/middleware/automationTokenAuthMiddleware.ts

'use strict';

import type { Request, Response, NextFunction } from 'express';
import AutomationToken from '../models/AutomationToken';
import User from '../models/User';
import { hashAutomationToken } from '../utils/automationTokenHash';

/**
 * Authenticate requests using an automation token.
 * Expects Authorization: Bearer at_<token>
 */
export async function protectAutomationToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token.startsWith('at_')) {
    return res.status(401).json({ message: 'Automation token required' });
  }

  try {
    const tokenHash = hashAutomationToken(token);

    const record = await AutomationToken.findOne({ tokenHash }).lean();

    if (!record) {
      return res.status(401).json({ message: 'Invalid automation token' });
    }

    if (record.revokedAt) {
      return res.status(401).json({ message: 'Automation token revoked' });
    }

    if (record.expiresAt && new Date(record.expiresAt).getTime() <= Date.now()) {
      return res.status(401).json({ message: 'Automation token expired' });
    }

    const user = await User.findById(record.user).select('-password').lean();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User inactive' });
    }

    req.user = user as any;

    await AutomationToken.updateOne({ _id: record._id }, { $set: { lastUsedAt: new Date() } });

    return next();
  } catch (err) {
    return res.status(500).json({ message: 'Automation auth failed' });
  }
}
