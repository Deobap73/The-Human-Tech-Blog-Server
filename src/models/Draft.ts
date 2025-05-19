// src/models/Draft.ts

import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Draft', draftSchema);
