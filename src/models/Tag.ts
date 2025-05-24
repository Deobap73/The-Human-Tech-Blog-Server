// src/models/Tag.ts

import { Schema, model, InferSchemaType, CallbackError } from 'mongoose';
import slugify from 'slugify';
import { MongoServerError } from 'mongodb';

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      minlength: [2, 'Tag name must be at least 2 characters'],
      maxlength: [50, 'Tag name must be at most 50 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    color: {
      type: String, // Por exemplo, #ffaa00
    },
  },
  { timestamps: true }
);

tagSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
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

export type ITag = InferSchemaType<typeof tagSchema>;
export default model('Tag', tagSchema);
