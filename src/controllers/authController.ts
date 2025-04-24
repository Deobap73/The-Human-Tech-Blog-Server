// The-Human-Tech-Blog-Server/src/controllers/authController.ts

import { Request, Response } from 'express';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, avatar } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, password, avatar });
    await user.save();

    const { password: _, ...userData } = user.toObject();
    return res.status(201).json({ message: 'User registered', user: userData });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
