// /src/models/Post.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PostTranslation {
  title: string;
  content: string;
  description: string;
}

export interface IPost extends Document {
  slug: string;
  translations: {
    en?: PostTranslation;
    pt?: PostTranslation;
    de?: PostTranslation;
    es?: PostTranslation;
    [key: string]: PostTranslation | undefined;
  };
  categories: Types.ObjectId[];
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema = new Schema<PostTranslation>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  description: { type: String, required: true },
});

const PostSchema = new Schema<IPost>(
  {
    slug: { type: String, required: true, unique: true },
    translations: {
      en: { type: TranslationSchema, required: true },
      pt: { type: TranslationSchema, required: false },
      de: { type: TranslationSchema, required: false },
      es: { type: TranslationSchema, required: false },
    },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', PostSchema);
