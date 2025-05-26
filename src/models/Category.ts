// src/models/Category.ts

import { Schema, model, Document } from 'mongoose';
import slugify from 'slugify';
import { MongoServerError } from 'mongodb';

export interface CategoryTranslation {
  name: string;
  description?: string;
}

export interface ICategory extends Document {
  slug: string;
  translations: {
    en: CategoryTranslation;
    pt?: CategoryTranslation;
    de?: CategoryTranslation;
    es?: CategoryTranslation;
    [key: string]: CategoryTranslation | undefined;
  };
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    translations: {
      en: {
        name: { type: String, required: true, minlength: 2, maxlength: 50 },
        description: { type: String },
      },
      pt: {
        name: { type: String, minlength: 2, maxlength: 50 },
        description: { type: String },
      },
      de: {
        name: { type: String, minlength: 2, maxlength: 50 },
        description: { type: String },
      },
      es: {
        name: { type: String, minlength: 2, maxlength: 50 },
        description: { type: String },
      },
    },
    logo: { type: String },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  // Preferencialmente usa o slug do nome em inglês (pode ser ajustado conforme lógica de negócio)
  const mainName =
    this.translations?.en?.name ||
    this.translations?.pt?.name ||
    this.translations?.de?.name ||
    this.translations?.es?.name;
  if (!this.slug && mainName) {
    this.slug = slugify(mainName, { lower: true, strict: true });
  }
  next();
});

categorySchema.post('save', function (error: any, _doc: any, next: (err?: any) => void) {
  const mongoError = error as MongoServerError;
  if (mongoError?.code === 11000 && mongoError?.keyPattern?.slug) {
    next(new Error('Slug must be unique. A category with this name already exists.'));
  } else {
    next(error);
  }
});

export default model<ICategory>('Category', categorySchema);
