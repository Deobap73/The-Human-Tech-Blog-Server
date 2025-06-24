// /src/scripts/create-admin.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../models/User';

dotenv.config();

/**
 * Prompts the user for input in the terminal.
 */
const prompt = (query: string): Promise<string> =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    });
  });

/**
 * Main function: creates a new admin user with provided data.
 */
const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('📦 Connected to MongoDB');

    const name = await prompt('Admin name: ');
    const email = await prompt('Admin email: ');
    const password = await prompt('Admin password: ');

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.error('❌ An user with this email already exists.');
      process.exit(1);
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin user created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
