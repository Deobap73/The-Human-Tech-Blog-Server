// src/models/NewsletterSubscriber.ts

import { Schema, model, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  confirmed: boolean;
  confirmationToken: string | null;
  unsubscribeToken: string | null;
  confirmationSentAt: Date | null;
  unsubscribed: boolean;
  unsubscribedAt: Date | null;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: null },
    unsubscribeToken: { type: String, default: null },
    confirmationSentAt: { type: Date, default: null },
    unsubscribed: { type: Boolean, default: false },
    unsubscribedAt: { type: Date, default: null },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

export default model<INewsletterSubscriber>('NewsletterSubscriber', newsletterSubscriberSchema);
