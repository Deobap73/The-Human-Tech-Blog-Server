// ✅ The-Human-Tech-Blog-Server/src/routes/setupRoutes.ts

import express from 'express';
import User from '../models/User';
import { hash } from 'bcryptjs';

const router = express.Router();

router.post('/admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const hashed = await hash(password, 12);
    const newAdmin = new User({ name, email, password: hashed, role: 'admin' });
    await newAdmin.save();

    return res.status(201).json({ message: 'Admin created' });
  } catch (error) {
    console.error('[Setup Admin]', error);
    return res.status(500).json({ message: 'Failed to create admin' });
  }
});

export default router;
