// The-Human-Tech-Blog-Server/src/routes/setupRoutes.ts
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

const router = express.Router();

router.post('/create-admin', async (req, res) => {
  const { name, email, password, key } = req.body;

  if (key !== process.env.SETUP_KEY) {
    return res.status(401).json({ message: 'Invalid setup key' });
  }

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    return res.status(400).json({ message: 'Admin already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = new User({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
  });

  await newAdmin.save();
  return res.status(201).json({ message: 'Admin created with success' });
});

export default router;
