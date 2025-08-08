// The-Human-Tech-Blog-Server/src/models/Comment.ts

import { Schema, Types, model } from 'mongoose';

export interface IComment {
  postId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  userName?: string | null;

  guestName?: string | null;
  guestEmail?: string | null;
  guestWebsite?: string | null;

  text: string;
  status: 'pending' | 'approved' | 'rejected';
  moderatedBy?: Types.ObjectId | null;
  recaptchaScore?: number | null;
  ipHash?: string | null;
  userAgent?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },

    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: null },

    guestName: { type: String, default: null },
    guestEmail: { type: String, default: null },
    guestWebsite: { type: String, default: null },

    text: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    recaptchaScore: { type: Number, default: null },
    ipHash: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

export default model<IComment>('Comment', CommentSchema);
