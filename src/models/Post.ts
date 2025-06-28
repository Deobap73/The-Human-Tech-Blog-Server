import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PostTranslation {
  title?: string;
  content?: string;
  description?: string;
}

export interface IPost extends Document {
  slug: string;
  image: string;
  status: 'draft' | 'published' | 'archived';
  isQuickPost?: boolean; // 🔥 NEW FIELD
  translations: {
    en: PostTranslation;
    pt?: PostTranslation;
    de?: PostTranslation;
    es?: PostTranslation;
    [key: string]: PostTranslation | undefined;
  };
  categories: Types.ObjectId[];
  tags: Types.ObjectId[];
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema = new Schema<PostTranslation>(
  {
    title: { type: String },
    content: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      required: true,
      default: 'draft',
    },
    isQuickPost: {
      type: Boolean,
      default: false,
    },
    translations: {
      en: {
        type: TranslationSchema,
        required: true,
        validate: {
          validator: function (v: any) {
            return v && v.title && v.content && v.description;
          },
          message: 'English translation (title, content, description) is required!',
        },
      },
      pt: { type: TranslationSchema },
      de: { type: TranslationSchema },
      es: { type: TranslationSchema },
    },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', PostSchema);
