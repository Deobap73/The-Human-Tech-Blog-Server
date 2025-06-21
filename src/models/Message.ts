// src/models/Message.ts

import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  seen: boolean;
  fileUrl?: string; // File attachment (image/pdf) URL
  fileType?: string; // MIME type, e.g. "image/png" or "application/pdf"
  fileName?: string; // Original file name
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    seen: { type: Boolean, default: false },
    fileUrl: { type: String }, // Optional attachment (Cloudinary or other)
    fileType: { type: String }, // MIME type
    fileName: { type: String }, // Original file name
  },
  { timestamps: true }
);

export const Message = model<IMessage>('Message', messageSchema);
