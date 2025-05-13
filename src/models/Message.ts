// src/models/Message.ts

import mongoose, { Document, Schema } from 'mongoose';
import { ChatMessage } from '@/types/ChatMessage';

export interface IMessage extends Omit<ChatMessage, 'conversationId' | 'sender'>, Document {
  sender: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  text: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Conversation',
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
