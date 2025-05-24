// src/models/Post.ts
import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IPost extends Document {
  title: string;
  description: string;
  content: string;
  image?: string;
  tags: mongoose.Types.ObjectId[]; // Relacionamento real
  status: 'draft' | 'published';
  author: mongoose.Types.ObjectId;
  categories: mongoose.Types.ObjectId[];
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }], // Relaciona com Tag
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    slug: { type: String, unique: true },
  },
  {
    timestamps: true,
  }
);

PostSchema.pre<IPost>('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model<IPost>('Post', PostSchema);
