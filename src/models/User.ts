// The-Human-Tech-Blog-Server/src/models/User.ts

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// TypeScript interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'user' | 'admin' | 'editor';
  comparePassword: (password: string) => Promise<boolean>;
}

// Mongoose schema
const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin', 'editor'], default: 'user' },
  },
  { timestamps: true }
);

// Middleware: Hash password before save
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
