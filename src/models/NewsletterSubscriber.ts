// src/models/NewsletterSubscriber.ts

import { Schema, model, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  createdAt: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model<INewsletterSubscriber>('NewsletterSubscriber', newsletterSubscriberSchema);
