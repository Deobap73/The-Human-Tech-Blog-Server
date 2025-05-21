// ✅ The-Human-Tech-Blog-Server/src/utils/logAdminAction.ts
import { Types } from 'mongoose';
import { UserActionLog } from '../models/UserActionLog';

export const logAdminAction = async (
  userId: Types.ObjectId,
  action: string,
  description?: string
): Promise<void> => {
  try {
    await UserActionLog.create({
      user: userId,
      action,
      description,
    });
  } catch (error) {
    console.error('[Admin Action Log Error]', error);
  }
};
