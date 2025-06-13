// src/models/TokenBlacklist.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface TokenBlacklistDoc extends Document {
  token: string;
  expiresAt: Date;
}

const TokenBlacklistSchema = new Schema<TokenBlacklistDoc>({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
});

export default mongoose.model<TokenBlacklistDoc>('TokenBlacklist', TokenBlacklistSchema);
