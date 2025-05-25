// The-Human-Tech-Blog-Server/src/models/Comment.ts

import { Schema, Types, model } from 'mongoose';

export interface IComment {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  moderatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default model<IComment>('Comment', CommentSchema);
