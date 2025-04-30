// The-Human-Tech-Blog-Server/src/controllers/authController.ts

import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  const token = generateToken({ userId: user._id, role: user.role });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...userData } = user.toObject();
  return res.status(200).json({ message: 'Login successful', user: userData });
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  const { name, email, password, avatar } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const user = new User({ name, email, password, avatar });
  await user.save();

  const { password: _, ...userData } = user.toObject();
  return res.status(201).json({ message: 'User registered', user: userData });
};

// GET ME
export const getMe = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  return res.status(200).json({ user: req.user });
};

// LOGOUT
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};
