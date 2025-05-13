// src/types/ChatMessage.ts

export interface ChatMessage {
  conversationId: string;
  text: string;
  senderId: string;
  timestamp?: string; // ISO format optional
}
