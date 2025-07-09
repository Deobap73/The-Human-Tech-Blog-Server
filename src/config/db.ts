// The-Human-Tech-Blog-Server/src/config/db.ts

import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.log('⚠️  Disconnected from MongoDB'));
