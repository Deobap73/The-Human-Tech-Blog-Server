// The-Human-Tech-Blog-Server/src/models/Notification.ts
import mongoose, { Schema } from 'mongoose';

export interface INotification extends mongoose.Document {
  user: mongoose.Types.ObjectId | string;
  type: 'comment' | 'post' | 'admin' | 'system';
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['comment', 'post', 'admin', 'system'], default: 'system' },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
