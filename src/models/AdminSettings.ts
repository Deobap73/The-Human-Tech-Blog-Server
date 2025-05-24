// The-Human-Tech-Blog-Server/src/models/AdminSettings.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSettings extends Document {
  siteTitle: string;
  enableChat: boolean;
  maxUsers: number;
}

const AdminSettingsSchema = new Schema({
  siteTitle: { type: String, default: 'The Human Tech Blog' },
  enableChat: { type: Boolean, default: true },
  maxUsers: { type: Number, default: 100 },
});

export default mongoose.model<IAdminSettings>('AdminSettings', AdminSettingsSchema);
