// The-Human-Tech-Blog-Server/src/controllers/authController.ts

import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  console.log('[Register Request Body]', req.body);
  try {
    const { name, email, password, avatar } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, password, avatar });
    await user.save();

    const { password: _, ...userData } = user.toObject();
    return res.status(201).json({ message: 'User registered', user: userData });
  } catch (error: any) {
    console.error('[Register Error]', error.message); // 👈 detailed log
    return res.status(500).json({ message: 'Server error', error: error.message }); // 👈 send real message
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Step 1: Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Step 2: Verify the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Step 3: Generate the JWT
    const token = generateToken({ userId: user._id, role: user.role });

    // Step 4: Envia como cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // 👈 true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    // Step 5: Return the user (without password)
    const { password: _, ...userData } = user.toObject();
    return res.status(200).json({ message: 'Login successful', user: userData });
  } catch (error: any) {
    console.error('[Login Error]', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({ user: req.user });
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};
