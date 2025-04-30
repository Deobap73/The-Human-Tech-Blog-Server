// The-Human-Tech-Blog-Server/src/config/db.ts

import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Eventos de conexão para melhor logging
mongoose.connection.on('connecting', () => console.log('Connecting to MongoDB...'));
mongoose.connection.on('disconnected', () => console.log('Disconnected from MongoDB'));
