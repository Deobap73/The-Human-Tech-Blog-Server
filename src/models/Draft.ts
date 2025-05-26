// /src/models/Draft.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDraft extends Document {
  title: string;
  content: string;
  description: string;
  image?: string;
  tags?: string[];
  author: Types.ObjectId;
  categories?: Types.ObjectId[];
  // ... outros campos que existam nos drafts
}

const DraftSchema = new Schema<IDraft>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    tags: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  },
  { timestamps: true }
);

export default mongoose.model<IDraft>('Draft', DraftSchema);
