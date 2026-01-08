// /src/controllers/automationTokenController.ts

'use strict';

import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import AutomationToken from '../models/AutomationToken';
import { generateAutomationToken, hashAutomationToken } from '../utils/automationTokenHash';
import { logAdminAction } from '../utils/logAdminAction';
import type { IUser } from '../types/User';

type CreateBody = {
  name?: string;
  expiresAt?: string;
};

export async function createAutomationToken(req: Request, res: Response) {
  const user = req.user as IUser;
  const body = (req.body || {}) as CreateBody;

  try {
    const name = (body.name || 'make').trim() || 'make';

    const plaintext = generateAutomationToken();
    const tokenHash = hashAutomationToken(plaintext);

    const expiresAt = (body.expiresAt || '').trim()
      ? new Date(body.expiresAt as string)
      : undefined;

    const created = await AutomationToken.create({
      user: user._id,
      name,
      tokenHash,
      expiresAt,
    });

    await logAdminAction(
      user._id as unknown as Types.ObjectId,
      'CREATE_AUTOMATION_TOKEN',
      `Created automation token ${created._id}`
    );

    return res.status(201).json({
      message: 'Automation token created',
      token: plaintext,
      record: {
        id: created._id,
        name: created.name,
        lastUsedAt: created.lastUsedAt,
        expiresAt: created.expiresAt,
        revokedAt: created.revokedAt,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create automation token' });
  }
}

export async function listAutomationTokens(req: Request, res: Response) {
  const user = req.user as IUser;

  try {
    const tokens = await AutomationToken.find({ user: user._id })
      .select('name lastUsedAt expiresAt revokedAt createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(tokens);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list automation tokens' });
  }
}

export async function revokeAutomationToken(req: Request, res: Response) {
  const user = req.user as IUser;
  const { id } = req.params;

  try {
    const updated = await AutomationToken.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: { revokedAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Token not found' });
    }

    await logAdminAction(
      user._id as unknown as Types.ObjectId,
      'REVOKE_AUTOMATION_TOKEN',
      `Revoked automation token ${id}`
    );

    return res.status(200).json({ message: 'Token revoked' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to revoke token' });
  }
}
