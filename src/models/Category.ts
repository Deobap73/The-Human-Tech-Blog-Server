// ✅ The-Human-Tech-Blog-Server/src/models/Category.ts
import { Schema, model, InferSchemaType, CallbackError } from 'mongoose';
import slugify from 'slugify';
import { MongoServerError } from 'mongodb';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name must be at most 50 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
    },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

categorySchema.post('save', function (error: CallbackError, _doc: any, next: (err?: any) => void) {
  const mongoError = error as MongoServerError;
  if (mongoError?.code === 11000 && mongoError?.keyPattern?.slug) {
    next(new Error('Slug must be unique. A category with this name already exists.'));
  } else {
    next(error);
  }
});

export type ICategory = InferSchemaType<typeof categorySchema>;
export default model('Category', categorySchema);
