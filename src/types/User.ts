// src/types/User.ts

import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'user';

  // 2FA
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorTempSecret?: string;

  // Methods
  comparePassword(candidate: string): Promise<boolean>;
}
