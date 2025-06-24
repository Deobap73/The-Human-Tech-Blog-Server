// /src/scripts/create-admin.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import User from '../models/User';

dotenv.config();

/**
 * Main function: creates a new admin user with provided data,
 * password is securely entered (hidden).
 */
const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('📦 Connected to MongoDB');

    // Prompt admin info
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Admin name:' },
      { type: 'input', name: 'email', message: 'Admin email:' },
      {
        type: 'password',
        name: 'password',
        message: 'Admin password:',
        mask: '*',
      },
    ]);

    // Check if admin already exists
    const existing = await User.findOne({ email: answers.email });
    if (existing) {
      console.error('❌ A user with this email already exists.');
      process.exit(1);
    }

    const admin = new User({
      name: answers.name,
      email: answers.email,
      password: answers.password,
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
