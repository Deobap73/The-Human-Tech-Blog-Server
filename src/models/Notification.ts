// src/models/Notification.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface NotificationTranslation {
  title: string;
  message: string;
}

export interface INotification extends Document {
  user: Types.ObjectId | string;
  type: 'comment' | 'post' | 'admin' | 'system';
  meta?: any;
  read: boolean;
  translations: {
    [key: string]: NotificationTranslation | undefined | null;
    en?: NotificationTranslation | null;
    pt?: NotificationTranslation | null;
    de?: NotificationTranslation | null;
    es?: NotificationTranslation | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['comment', 'post', 'admin', 'system'], default: 'system' },
    meta: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    translations: {
      type: Object,
      required: true,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
