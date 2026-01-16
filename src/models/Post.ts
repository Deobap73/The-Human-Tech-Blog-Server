// ./src/models/Post.ts

'use strict';

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PostTranslation {
  title?: string;
  content?: string;
  description?: string;
}

export type AutomationMeta = {
  sheetId: string;
  sourceKey: string;
  contentKind: 'Post' | 'TechShort';
  size: 'short' | 'medium' | 'large';
  cta?: string;
};

export interface IPost extends Document {
  slug: string;
  image: string;
  status: 'draft' | 'published' | 'archived';
  isQuickPost?: boolean;
  isAiPrompt?: boolean;
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

  automation?: AutomationMeta;

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

const AutomationSchema = new Schema<AutomationMeta>(
  {
    sheetId: { type: String, required: true },
    sourceKey: { type: String, required: true, index: true },
    contentKind: { type: String, enum: ['Post', 'TechShort'], required: true },
    size: { type: String, enum: ['short', 'medium', 'large'], required: true },
    cta: { type: String, required: false },
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
    isAiPrompt: {
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

    automation: { type: AutomationSchema, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', PostSchema);
