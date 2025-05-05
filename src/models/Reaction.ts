// The-Human-Tech-Blog-Server/src/models/Reaction.ts

import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'love', 'funny', 'sad', 'angry'],
      default: 'like',
    },
  },
  { timestamps: true }
);

reactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Reaction', reactionSchema);
