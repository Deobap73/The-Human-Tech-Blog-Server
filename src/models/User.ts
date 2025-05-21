// ✅ The-Human-Tech-Blog-Server/src/models/User.ts

import mongoose, { Schema, InferSchemaType } from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatar: String,
    role: { type: String, enum: ['user', 'admin', 'editor'], default: 'user' },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    twoFactorTempSecret: { type: String },
  },
  { timestamps: true }
);

// ✅ Tipagem inferida a partir do schema
export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
};

// 🔐 Hash da password antes de salvar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Método de comparação de senhas
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
