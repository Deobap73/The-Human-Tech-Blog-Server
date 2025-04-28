// The-Human-Tech-Blog-Server/src/models/Category.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  logo: string; // ✅ campo de logo adicionado
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, required: true }, // ✅ agora é obrigatório
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
