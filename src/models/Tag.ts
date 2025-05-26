// src/models/Tag.ts

import { Schema, model, Document, CallbackError } from 'mongoose';
import slugify from 'slugify';
import { MongoServerError } from 'mongodb';

export interface TagTranslation {
  name: string;
  description?: string;
}

export interface ITag extends Document {
  slug: string;
  color?: string;
  translations: {
    [key: string]: TagTranslation | undefined | null;
    en?: TagTranslation | null;
    pt?: TagTranslation | null;
    de?: TagTranslation | null;
    es?: TagTranslation | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

// REMOVE <ITag> aqui
const tagSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    color: {
      type: String, // Ex: "#ffaa00"
    },
    translations: {
      en: {
        name: { type: String, required: true, minlength: 2, maxlength: 50 },
        description: { type: String },
      },
      pt: {
        name: { type: String },
        description: { type: String },
      },
      de: {
        name: { type: String },
        description: { type: String },
      },
      es: {
        name: { type: String },
        description: { type: String },
      },
    },
  },
  { timestamps: true }
);

tagSchema.pre('validate', function (next) {
  // Use translations.en.name as canonical
  // @ts-ignore
  if (!this.slug && this.translations && this.translations.en && this.translations.en.name) {
    // @ts-ignore
    this.slug = slugify(this.translations.en.name, { lower: true, strict: true });
  }
  next();
});

tagSchema.post('save', function (error: CallbackError, _doc: any, next: (err?: any) => void) {
  const mongoError = error as MongoServerError;
  if (mongoError?.code === 11000 && mongoError?.keyPattern?.slug) {
    next(new Error('Slug must be unique. A tag with this name already exists.'));
  } else {
    next(error);
  }
});

export default model<ITag>('Tag', tagSchema);
