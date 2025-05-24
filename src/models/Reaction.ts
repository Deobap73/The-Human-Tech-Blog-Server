// src/models/Reaction.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction extends Document {
  targetType: 'post' | 'comment';
  targetId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  emoji: string; // exemplo: '👍', '😂', etc
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema: Schema<IReaction> = new Schema(
  {
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

// Um user pode reagir com 1 emoji a cada post/comentário (mas pode trocar)
ReactionSchema.index({ targetType: 1, targetId: 1, userId: 1, emoji: 1 }, { unique: true });

export default mongoose.model<IReaction>('Reaction', ReactionSchema);
