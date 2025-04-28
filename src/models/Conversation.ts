// The-Human-Tech-Blog-Server/src/models/Conversation.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // [Admin, User]
}

const ConversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  },
  { timestamps: true }
);

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
