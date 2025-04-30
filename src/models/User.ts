// The-Human-Tech-Blog-Server/src/models/User.ts

import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'user' | 'admin' | 'editor';
  comparePassword: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin', 'editor'], default: 'user' },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return await bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
