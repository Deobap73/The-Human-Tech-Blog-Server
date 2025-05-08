// src/routes/setupRoutes.ts
import { Router } from 'express';
import { env } from '../config/env';
import { signAccessToken } from '../utils/jwt';
import User from '../models/User';
import commentRoutes from './commentRoutes';
import reactionRoutes from './reactionRoutes';
import bookmarkRoutes from './bookmarkRoutes';

const router = Router();

router.post('/create-admin', async (req, res) => {
  const { name, email, password, key } = req.body;

  if (!name || !email || !password || !key) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (key !== env.SETUP_KEY) {
    return res.status(401).json({ message: 'Invalid setup key' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const admin = new User({ name, email, password, role: 'admin' });
  await admin.save();

  const token = signAccessToken(admin._id.toString());

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...adminData } = admin.toObject();
  return res.status(201).json({ message: 'Admin created', user: adminData });
});

//Routers
router.use('/comments', commentRoutes);
router.use('/reactions', reactionRoutes);
router.use('/bookmarks', bookmarkRoutes);

export default router;
