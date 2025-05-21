// ✅ The-Human-Tech-Blog-Server/src/models/UserActionLog.ts
import { Schema, model } from 'mongoose';

const userActionLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    description: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const UserActionLog = model('UserActionLog', userActionLogSchema);
