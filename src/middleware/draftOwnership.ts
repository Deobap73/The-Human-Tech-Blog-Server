// 📄 The-Human-Tech-Blog-Server/src/middleware/draftOwnership.ts

import { Request, Response, NextFunction } from 'express';
import Draft from '../models/Draft';
import { IUser } from '../types/User';

export const verifyDraftOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const draftId = req.params.id;
  const user = req.user as IUser;

  try {
    const draft = await Draft.findById(draftId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    if (!user || (user._id as unknown as string) !== draft.author.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this draft' });
    }

    next();
  } catch (error) {
    console.error('[verifyDraftOwnership]', error);
    return res.status(500).json({ message: 'Server error validating draft ownership' });
  }
};
