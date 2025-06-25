import { Request, Response, NextFunction } from 'express';
import Draft from '../models/Draft';
import { IUser } from '../types/User';

/**
 * Middleware to verify that the authenticated user is the owner of the draft.
 * It compares both user._id and draft.author as strings to avoid ObjectId type issues.
 */
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

    // Always compare ObjectId values as strings to avoid false negatives
    if (!user || String(user._id) !== String(draft.author)) {
      // Debug logging for ownership validation
      console.warn('[verifyDraftOwnership] Forbidden: User is not the author of the draft', {
        userId: String(user?._id),
        draftAuthor: String(draft.author),
      });
      return res.status(403).json({ message: 'Not authorized to access this draft' });
    }

    // Ownership confirmed, continue to the next middleware or controller
    next();
  } catch (error) {
    // Log the error for debugging purposes
    console.error('[verifyDraftOwnership]', error);
    return res.status(500).json({ message: 'Server error validating draft ownership' });
  }
};
