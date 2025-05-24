import { Request, Response } from 'express';
import User from '../models/User';

// Listar todos os utilizadores (paginação opcional)
export const listUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const users = await User.find().skip(skip).limit(limit).select('-password');
  const total = await User.countDocuments();
  res.json({ users, total, page, pages: Math.ceil(total / limit) });
};

// Atualizar role de utilizador
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!['user', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('[updateUserRole]', error);
    return res.status(500).json({ message: 'Failed to update user role' });
  }
};

// Ativar/desativar utilizador
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { active } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !!active },
      { new: true, select: '-password' }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('[updateUserStatus]', error);
    return res.status(500).json({ message: 'Failed to update user status' });
  }
};
